import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import type {
  DiscordChannel,
  GuildAttributes,
  GuildChannelsResponse,
  GuildConfig,
  GuildReadinessResponse,
  DiscordRole,
} from "../../lib/types";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { SectionCard } from "../../components/dashboard/SectionCard";
import { SetupChecklist } from "../../components/dashboard/SetupChecklist";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ChannelMultiSelect } from "../../components/forms/ChannelMultiSelect";
import { ChannelSelect } from "../../components/forms/ChannelSelect";
import { RoleMultiSelect } from "../../components/forms/RoleMultiSelect";
import { RoleSelect } from "../../components/forms/RoleSelect";
import { Switch } from "../../components/forms/Switch";
import { useAuth } from "../../app/providers/AuthProvider";
import { NumberField } from "../../components/forms/NumberField";

const TAB_LABELS = [
  "overview",
  "channels",
  "roles",
  "economy",
  "gameplay",
] as const;

type WorkspaceTab = (typeof TAB_LABELS)[number];

function getSafeTab(value: string | null): WorkspaceTab {
  if (value && TAB_LABELS.includes(value as WorkspaceTab)) {
    return value as WorkspaceTab;
  }
  return "overview";
}

export function GuildWorkspacePage() {
  const { guildId = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = getSafeTab(searchParams.get("tab"));

  const [config, setConfig] = useState<GuildConfig | null>(null);
  const [draft, setDraft] = useState<GuildAttributes | null>(null);
  const [readiness, setReadiness] = useState<GuildReadinessResponse | null>(
    null,
  );
  const [channelsResponse, setChannelsResponse] =
    useState<GuildChannelsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string>("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [roles, setRoles] = useState<DiscordRole[]>([]);
  const { refreshUser } = useAuth();
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);

  useEffect(() => {
    async function loadRoles() {
      try {
        const response = await api.getDiscordRoles(guildId);
        setRoles(response.roles ?? []);
      } catch (error) {
        console.error(error);
        setRoles([]);
      }
    }

    loadRoles();
  }, [guildId]);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [configResponse, readinessResponse, channels] = await Promise.all([
        api.getGuildConfig(guildId),
        api.getGuildReadiness(guildId),
        api.getGuildChannels(guildId),
      ]);
      setConfig(configResponse);
      setDraft(configResponse.server);
      setReadiness(readinessResponse);
      setChannelsResponse(channels);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load guild workspace",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!guildId) {
      return;
    }
    load().catch(() => undefined);
  }, [guildId]);

  const dirty = useMemo(
    () => JSON.stringify(config?.server) !== JSON.stringify(draft),
    [config?.server, draft],
  );

  function setField<K extends keyof GuildAttributes>(
    key: K,
    value: GuildAttributes[K],
  ) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function setChannelSelect(
    key: keyof Pick<
      GuildAttributes,
      | "killfeed_channel"
      | "connection_logs_channel"
      | "base_build_logs_channel"
      | "active_players_channel"
      | "welcome_channel"
    >,
    value: string,
  ) {
    setField(key, value as GuildAttributes[typeof key]);
  }

  async function handleSave() {
    if (!draft) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await api.updateGuildConfig(guildId, draft);
      setDraft(response.server);
      setConfig((current) =>
        current ? { ...current, server: response.server } : current,
      );
      const readinessResponse = await api.getGuildReadiness(guildId);
      setReadiness(readinessResponse);
      setMessage(response.message || "Configuration saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save configuration",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleParserAction(next: "activate" | "deactivate") {
    setActionLoading(next);
    setError("");
    setMessage("");

    try {
      const response =
        next === "activate"
          ? await api.activateGuild(guildId)
          : await api.deactivateGuild(guildId);
      setMessage(response.message || `Guild ${next}d.`);
      await load();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : `Failed to ${next} parser`,
      );
    } finally {
      setActionLoading("");
    }
  }

  async function handleUnlink() {
    setActionLoading("unlink");
    setError("");
    setMessage("");

    try {
      await api.unlinkGuild(guildId);
      await refreshUser();
      navigate("/dashboard/guilds", { replace: true });
    } catch (unlinkError) {
      setError(
        unlinkError instanceof Error
          ? unlinkError.message
          : "Failed to unlink guild",
      );
    } finally {
      setActionLoading("");
      setShowUnlinkDialog(false);
    }
  }

  function changeTab(tab: WorkspaceTab) {
    setSearchParams({ tab });
  }

  if (loading) {
    return (
      <SectionCard
        title="Guild workspace"
        description={`Loading guild ${guildId}...`}
      >
        <p className="muted-text">Fetching config, channels, and readiness.</p>
      </SectionCard>
    );
  }

  if (!config || !draft) {
    return (
      <SectionCard title="Guild workspace" description={`Guild ${guildId}`}>
        <p className="feedback feedback--danger">
          {error || "Guild not found."}
        </p>
      </SectionCard>
    );
  }

  const channels: DiscordChannel[] = channelsResponse?.channels ?? [];

  return (
    <div className="page-grid">
      <SectionCard
        title={draft.server_name || guildId}
        description="Configure DayZ Reforger to operate how you want"
      >
        <div className="workspace-header workspace-header--wrap">
          <div className="stack-inline">
            <StatusBadge tone={readiness?.ready ? "success" : "warning"}>
              {readiness?.ready ? "Ready to activate" : "Setup incomplete"}
            </StatusBadge>
            <StatusBadge tone={config.active ? "success" : "neutral"}>
              {config.active ? "Parser active" : "Parser inactive"}
            </StatusBadge>
            {config.nitrado?.mission ? (
              <StatusBadge tone="neutral">{config.nitrado.mission}</StatusBadge>
            ) : null}
          </div>
          <div className="stack-inline">
            <button
              className="button button--secondary button--sm"
              onClick={() =>
                handleParserAction(config.active ? "deactivate" : "activate")
              }
              disabled={Boolean(actionLoading)}
            >
              {actionLoading === "activate"
                ? "Activating..."
                : actionLoading === "deactivate"
                  ? "Stopping..."
                  : config.active
                    ? "Stop parser"
                    : "Start parser"}
            </button>
            <button
              className="button button--secondary button--sm"
              onClick={handleSave}
              disabled={!dirty || saving}
            >
              {saving ? "Saving..." : dirty ? "Save changes" : "Saved"}
            </button>
            <button
              className="button button--secondary button--sm"
              onClick={() => setShowUnlinkDialog(true)}
              disabled={Boolean(actionLoading)}
            >
              {actionLoading === "unlink" ? "Unlinking..." : "Unlink"}
            </button>
          </div>
        </div>

        {message ? (
          <p className="feedback feedback--success">{message}</p>
        ) : null}
        {error ? <p className="feedback feedback--danger">{error}</p> : null}

        <div className="workspace-tabs">
          <button
            className={`workspace-tab${activeTab === "overview" ? " is-active" : ""}`}
            onClick={() => changeTab("overview")}
          >
            Overview
          </button>
          <button
            className={`workspace-tab${activeTab === "channels" ? " is-active" : ""}`}
            onClick={() => changeTab("channels")}
          >
            Channels
          </button>
          <button
            className={`workspace-tab${activeTab === "roles" ? " is-active" : ""}`}
            onClick={() => changeTab("roles")}
          >
            Roles & access
          </button>
          <button
            className={`workspace-tab${activeTab === "economy" ? " is-active" : ""}`}
            onClick={() => changeTab("economy")}
          >
            Economy
          </button>
          <button
            className={`workspace-tab${activeTab === "gameplay" ? " is-active" : ""}`}
            onClick={() => changeTab("gameplay")}
          >
            Gameplay
          </button>
        </div>

        {activeTab === "overview" ? (
          <div className="page-grid">
            {!channelsResponse?.bot_present ? (
              <div className="empty-state">
                <p>
                  The bot has not been added to this Discord server yet. Invite
                  it now so channel routing, role-based actions, and live server
                  features can work.
                </p>

                {channelsResponse?.invite_url ? (
                  <a
                    className="button button--primary button--sm"
                    href={channelsResponse.invite_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Invite bot
                  </a>
                ) : null}
              </div>
            ) : null}
            <div className="stat-grid">
              <div className="stat-panel">
                <span className="stat-panel__label">Guild</span>
                <strong>{guildId}</strong>
              </div>
              <div className="stat-panel">
                <span className="stat-panel__label">Nitrado service</span>
                <strong>{config.nitrado?.server_id ?? "Unlinked"}</strong>
              </div>
              <div className="stat-panel">
                <span className="stat-panel__label">Server name</span>
                <strong>{draft.server_name || "Unset"}</strong>
              </div>
            </div>
            {readiness ? <SetupChecklist items={readiness.checks} /> : null}
          </div>
        ) : null}

        {activeTab === "channels" ? (
          <div className="form-grid">
            {!channelsResponse?.bot_present ? (
              <div className="empty-state field--full">
                <p>
                  The bot is not currently in this Discord server. Invite it
                  before assigning channels.
                </p>
                {channelsResponse?.invite_url ? (
                  <a
                    className="button button--primary button--sm"
                    href={channelsResponse.invite_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Invite bot
                  </a>
                ) : null}
              </div>
            ) : null}

            <ChannelSelect
              id="killfeed_channel"
              label="Killfeed channel"
              value={draft.killfeed_channel}
              channels={channels}
              onChange={(value) => setChannelSelect("killfeed_channel", value)}
            />
            <ChannelSelect
              id="connection_logs_channel"
              label="Connection logs channel"
              value={draft.connection_logs_channel}
              channels={channels}
              onChange={(value) =>
                setChannelSelect("connection_logs_channel", value)
              }
            />
            <ChannelSelect
              id="base_build_logs_channel"
              label="Base build logs channel"
              value={draft.base_build_logs_channel}
              channels={channels}
              onChange={(value) =>
                setChannelSelect("base_build_logs_channel", value)
              }
            />
            <ChannelSelect
              id="active_players_channel"
              label="Active players channel"
              value={draft.active_players_channel}
              channels={channels}
              onChange={(value) =>
                setChannelSelect("active_players_channel", value)
              }
            />
            <ChannelSelect
              id="welcome_channel"
              label="Welcome channel"
              value={draft.welcome_channel}
              channels={channels}
              onChange={(value) => setChannelSelect("welcome_channel", value)}
            />

            <div className="field field--full">
              <ChannelMultiSelect
                label="Allowed command channels"
                hint="Choose which channels can be used for bot commands."
                channels={channels}
                value={draft.allowed_command_channels ?? []}
                onChange={(next) => setField("allowed_command_channels", next)}
              />
            </div>
          </div>
        ) : null}

        {activeTab === "roles" ? (
          <div className="form-grid">
            <RoleSelect
              label="Member role"
              value={draft.member_role ?? ""}
              roles={roles}
              hint="Optional default role for community members."
              onChange={(value) => setField("member_role", value)}
            />

            <RoleSelect
              label="Linked gamertag role"
              value={draft.linked_gamertag_role ?? ""}
              roles={roles}
              hint="Role granted or checked when a player links their gamertag."
              onChange={(value) => setField("linked_gamertag_role", value)}
            />

            <RoleSelect
              label="Admin alert role"
              value={draft.admin_alert_role ?? ""}
              roles={roles}
              hint="Role to alert admins of combat logs and more"
              onChange={(value) => setField("admin_alert_role", value)}
            />

            <br />

            <RoleMultiSelect
              label="Bot admin roles"
              hint="Members with these roles can use elevated bot controls."
              roles={roles}
              value={draft.bot_admin_roles}
              onChange={(next) => setField("bot_admin_roles", next)}
            />

            <RoleMultiSelect
              label="Excluded role IDs"
              hint="Members with these roles will be ignored for restricted actions."
              roles={roles}
              value={draft.excluded_roles}
              onChange={(next) => setField("excluded_roles", next)}
            />

            {/*<label className="field field--full">
              <span>Web admin user IDs</span>
              <textarea
                value={formatRoleList(draft.web_admin_user_ids)}
                onChange={(event) =>
                  setField(
                    "web_admin_user_ids",
                    parseCommaSeparatedList(event.target.value),
                  )
                }
                rows={3}
              />
            </label>*/}

            <div className="field field--full">
              <Switch
                label="Issue member role automatically"
                checked={Boolean(draft.issue_member_role)}
                hint="When enabled, the selected member role will be assigned automatically."
                onChange={(checked) => setField("issue_member_role", checked)}
              />
            </div>
          </div>
        ) : null}

        {activeTab === "economy" ? (
          <div className="form-grid">
            <NumberField
              label="Starting balance"
              value={draft.starting_balance}
              onChange={(value) => setField("starting_balance", value)}
            />
            <NumberField
              label="Income limit hours"
              value={draft.income_limit_hours}
              onChange={(value) => setField("income_limit_hours", value)}
            />
            <NumberField
              label="UAV price"
              value={draft.uav_price}
              onChange={(value) => setField("uav_price", value)}
            />
            <NumberField
              label="UAV radius meters"
              value={draft.uav_radius_meters}
              onChange={(value) => setField("uav_radius_meters", value)}
            />
            <NumberField
              label="EMP price"
              value={draft.emp_price}
              onChange={(value) => setField("emp_price", value)}
            />
            <NumberField
              label="EMP duration minutes"
              value={draft.emp_duration_minutes}
              onChange={(value) => setField("emp_duration_minutes", value)}
            />
            <div className="field">
              <Switch
                label="Enable UAV purchases"
                checked={Boolean(draft.enable_purchase_uav)}
                hint="Allow players to purchase UAV actions using the economy system."
                onChange={(checked) => setField("enable_purchase_uav", checked)}
              />
            </div>

            <div className="field">
              <Switch
                label="Enable EMP purchases"
                checked={Boolean(draft.enable_purchase_emp)}
                hint="Allow players to purchase EMP actions using the economy system."
                onChange={(checked) => setField("enable_purchase_emp", checked)}
              />
            </div>
          </div>
        ) : null}

        {activeTab === "gameplay" ? (
          <div className="form-grid">
            <label className="field">
              <span>Server name</span>
              <input
                value={draft.server_name}
                onChange={(event) =>
                  setField("server_name", event.target.value)
                }
              />
            </label>

            <NumberField
              label="Combat log timer minutes"
              value={draft.combat_log_timer_minutes}
              onChange={(value) => setField("combat_log_timer_minutes", value)}
            />

            {/*<div className="field">
              <Switch
                label="Auto restart"
                checked={Boolean(draft.auto_restart)}
                hint="Automatically restart the parser or linked service flow when supported."
                onChange={(checked) => setField("auto_restart", checked)}
              />
            </div>*/}

            <div className="field">
              <Switch
                label="Enable Combat Rating"
                checked={Boolean(draft.enable_combat_rating)}
                hint="A simple ELO engine for PVP to give players combat ratings"
                onChange={(checked) =>
                  setField("enable_combat_rating", checked)
                }
              />
            </div>

            <div className="field">
              <Switch
                label="Show killfeed coordinates"
                checked={Boolean(draft.show_killfeed_coords)}
                hint="Include coordinates in killfeed messages."
                onChange={(checked) =>
                  setField("show_killfeed_coords", checked)
                }
              />
            </div>

            <div className="field">
              <Switch
                label="Show killfeed weapon icon"
                checked={Boolean(draft.show_killfeed_weapon_icon)}
                hint="Include the weapon icon in killfeed messages."
                onChange={(checked) =>
                  setField("show_killfeed_weapon_icon", checked)
                }
              />
            </div>

            <div className="field">
              <Switch
                label="Send welcome message"
                checked={Boolean(draft.send_welcome_message)}
                hint="When enabled, the bot will send a join message to the configured welcome channel."
                onChange={(checked) =>
                  setField("send_welcome_message", checked)
                }
              />
            </div>

            <label className="field field--full">
              <span>Welcome message</span>
              <textarea
                value={draft.welcome_message}
                onChange={(event) =>
                  setField("welcome_message", event.target.value)
                }
                rows={4}
              />
            </label>
          </div>
        ) : null}
      </SectionCard>

      <ConfirmDialog
        open={showUnlinkDialog}
        tone="danger"
        title="Unlink this guild from its Nitrado service?"
        description="Killfeed, log parsing, welcome routing, and other linked service actions will stop for this guild after unlinking. Your saved guild configuration will remain in place, so you can relink this guild later without setting everything up again."
        confirmLabel="Unlink service"
        cancelLabel="Keep linked"
        loading={actionLoading === "unlink"}
        onConfirm={handleUnlink}
        onCancel={() => {
          if (!actionLoading) {
            setShowUnlinkDialog(false);
          }
        }}
      />
    </div>
  );
}
