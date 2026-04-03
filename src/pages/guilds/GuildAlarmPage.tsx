import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import { ALARM_MAPS, normalizeMission } from "../../lib/alarmMapConfig";
import type {
  AlarmZone,
  DiscordChannel,
  DiscordRole,
  GuildConfig,
} from "../../lib/types";
import { SectionCard } from "../../components/dashboard/SectionCard";
import { ChannelSelect } from "../../components/forms/ChannelSelect";
import { RoleSelect } from "../../components/forms/RoleSelect";
import { Switch } from "../../components/forms/Switch";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { AlarmMap } from "../../components/dashboard/AlarmMap";
import { NumberField } from "../../components/forms/NumberField";

const TAB_LABELS = ["overview", "create", "manage"] as const;

type WorkspaceTab = (typeof TAB_LABELS)[number];

type AlarmDraftErrors = {
  name?: string;
  originX?: string;
  originY?: string;
  radius?: string;
  channel?: string;
  role?: string;
  color?: string;
};

const COLOR_OPTIONS = [
  "#f08c2e",
  "#ff6b6b",
  "#5ec8ff",
  "#4ade80",
  "#c084fc",
  "#facc15",
];

function getSafeTab(value: string | null): WorkspaceTab {
  if (value && TAB_LABELS.includes(value as WorkspaceTab)) {
    return value as WorkspaceTab;
  }

  return "overview";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function createInitialAlarmDraft(
  worldWidth: number,
  worldHeight: number,
): AlarmZone {
  return {
    id: crypto.randomUUID(),
    origin: {
      x: Math.round(worldWidth / 2),
      y: Math.round(worldHeight / 2),
    },
    radius: 400,
    name: "",
    channel: "",
    role: "",
    ignored_players: [],
    rules: [],
    emp_exempt: false,
    show_player_coords: false,
    disabled: false,
    emp_expire: null,
    color: COLOR_OPTIONS[0],
  };
}

function validateAlarmDraft(
  zone: AlarmZone,
  worldWidth: number,
  worldHeight: number,
): AlarmDraftErrors {
  const errors: AlarmDraftErrors = {};

  if (!zone.name.trim()) {
    errors.name = "Alarm name is required.";
  } else if (zone.name.trim().length > 40) {
    errors.name = "Alarm name must be 40 characters or less.";
  }

  if (!Number.isFinite(zone.origin.x)) {
    errors.originX = "X coordinate is required.";
  } else if (zone.origin.x < 0 || zone.origin.x > worldWidth) {
    errors.originX = `X must be between 0 and ${worldWidth}.`;
  }

  if (!Number.isFinite(zone.origin.y)) {
    errors.originY = "Y coordinate is required.";
  } else if (zone.origin.y < 0 || zone.origin.y > worldHeight) {
    errors.originY = `Y must be between 0 and ${worldHeight}.`;
  }

  if (!Number.isFinite(zone.radius)) {
    errors.radius = "Radius is required.";
  } else if (zone.radius < 1 || zone.radius > 5000) {
    errors.radius = "Radius must be between 1 and 5000 meters.";
  }

  if (!zone.channel.trim()) {
    errors.channel = "Select an alert channel.";
  }

  if (!zone.role.trim()) {
    errors.role = "Select a ping role.";
  }

  if (!zone.color.trim()) {
    errors.color = "Select a zone color.";
  }

  return errors;
}

function hasDraftErrors(errors: AlarmDraftErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function GuildAlarmPage() {
  const { guildId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = getSafeTab(searchParams.get("tab"));

  const [draft, setDraft] = useState<AlarmZone | null>(null);
  const [draftErrors, setDraftErrors] = useState<AlarmDraftErrors>({});
  const [roles, setRoles] = useState<DiscordRole[]>([]);
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<GuildConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const mapDefinition = useMemo(() => {
    const mission = config?.nitrado?.mission;
    return ALARM_MAPS[normalizeMission(mission)];
  }, [config?.nitrado?.mission]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const [configResponse, rolesResponse, channelsResponse] =
          await Promise.all([
            api.getGuildConfig(guildId),
            api.getDiscordRoles(guildId),
            api.getGuildChannels(guildId),
          ]);

        setConfig(configResponse);
        setRoles(rolesResponse.roles ?? []);
        setChannels(channelsResponse.channels ?? []);

        const nextMapDefinition =
          ALARM_MAPS[normalizeMission(configResponse.nitrado?.mission)];

        const nextDraft = createInitialAlarmDraft(
          nextMapDefinition.worldWidth,
          nextMapDefinition.worldHeight,
        );

        setDraft(nextDraft);
        setDraftErrors(
          validateAlarmDraft(
            nextDraft,
            nextMapDefinition.worldWidth,
            nextMapDefinition.worldHeight,
          ),
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load alarm workspace",
        );
        setRoles([]);
        setChannels([]);
      } finally {
        setLoading(false);
      }
    }

    if (!guildId) {
      return;
    }

    load().catch(() => undefined);
  }, [guildId]);

  function changeTab(tab: WorkspaceTab) {
    setSearchParams({ tab });
  }

  function updateDraft(nextDraft: AlarmZone) {
    setDraft(nextDraft);
    setDraftErrors(
      validateAlarmDraft(
        nextDraft,
        mapDefinition.worldWidth,
        mapDefinition.worldHeight,
      ),
    );
  }

  function setField<K extends keyof AlarmZone>(key: K, value: AlarmZone[K]) {
    if (!draft) {
      return;
    }

    updateDraft({
      ...draft,
      [key]: value,
    });
  }

  function setOriginField(axis: "x" | "y", value: number) {
    if (!draft) {
      return;
    }

    const boundedValue =
      axis === "x"
        ? clamp(value, 0, mapDefinition.worldWidth)
        : clamp(value, 0, mapDefinition.worldHeight);

    updateDraft({
      ...draft,
      origin: {
        ...draft.origin,
        [axis]: Math.round(boundedValue),
      },
    });
  }

  function setRadius(value: number) {
    if (!draft) {
      return;
    }

    updateDraft({
      ...draft,
      radius: Math.round(clamp(value, 1, 5000)),
    });
  }

  function resetDraft() {
    const nextDraft = createInitialAlarmDraft(
      mapDefinition.worldWidth,
      mapDefinition.worldHeight,
    );

    setDraft(nextDraft);
    setDraftErrors(
      validateAlarmDraft(
        nextDraft,
        mapDefinition.worldWidth,
        mapDefinition.worldHeight,
      ),
    );
    setError("");
  }

  async function handleCreateAlarm() {
    if (!config || !draft) {
      return;
    }

    const nextErrors = validateAlarmDraft(
      draft,
      mapDefinition.worldWidth,
      mapDefinition.worldHeight,
    );

    setDraftErrors(nextErrors);

    if (hasDraftErrors(nextErrors)) {
      setError("Please fix the alarm fields before creating it.");
      setMessage("");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const nextServer = {
        ...config.server,
        alarms: [...config.server.alarms, draft],
      };

      const response = await api.updateGuildConfig(guildId, nextServer);

      setConfig((current) =>
        current ? { ...current, server: response.server } : current,
      );
      setMessage(response.message || "Alarm zone created.");
      resetDraft();
      changeTab("overview");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to create alarm zone",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SectionCard
        title="Alarm workspace"
        description={`Loading guild ${guildId}...`}
      >
        <p className="muted-text">Fetching alarm workspace.</p>
      </SectionCard>
    );
  }

  if (!config || !draft) {
    return (
      <SectionCard title="Alarm workspace" description={`Guild ${guildId}`}>
        <p className="feedback feedback--danger">
          {error || "Guild not found."}
        </p>
      </SectionCard>
    );
  }

  const isDraftValid = !hasDraftErrors(draftErrors);
  const overviewZones = config.server.alarms ?? [];

  return (
    <div className="page-grid">
      <SectionCard
        title={config.server.server_name || guildId}
        description="Configure alarm zones and rules"
      >
        <div className="workspace-header workspace-header--wrap">
          <div className="stack-inline">
            <StatusBadge tone="neutral">
              {config.nitrado?.mission || "Mission pending"}
            </StatusBadge>
            <StatusBadge tone={config.active ? "success" : "neutral"}>
              {config.active ? "Parser active" : "Parser inactive"}
            </StatusBadge>
            <StatusBadge tone="neutral">
              {overviewZones.length} alarm
              {overviewZones.length === 1 ? "" : "s"}
            </StatusBadge>
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
            className={`workspace-tab${activeTab === "create" ? " is-active" : ""}`}
            onClick={() => changeTab("create")}
          >
            Create
          </button>
          <button
            className={`workspace-tab${activeTab === "manage" ? " is-active" : ""}`}
            onClick={() => changeTab("manage")}
          >
            Manage
          </button>
        </div>

        {activeTab === "overview" ? (
          <div className="page-grid">
            <AlarmMap mission={config.nitrado?.mission} zones={overviewZones} />
          </div>
        ) : null}

        {activeTab === "create" ? (
          <div className="page-grid">
            <div className="alarm-create-layout">
              <div className="alarm-create-form">
                <div className="alarm-form-row alarm-form-row--full">
                  <label
                    className={`field${draftErrors.name ? " field--error" : ""}`}
                  >
                    <span className="field__label">Alarm name</span>
                    <p className="field__hint">
                      Keep it short and recognizable for admins.
                    </p>
                    <input
                      type="text"
                      value={draft.name}
                      maxLength={40}
                      placeholder="North West Airfield"
                      onChange={(event) => setField("name", event.target.value)}
                    />
                    {draftErrors.name ? (
                      <p className="field__error">{draftErrors.name}</p>
                    ) : null}
                  </label>
                </div>

                <div className="alarm-form-row alarm-form-row--selectors">
                  <div
                    className={`field${draftErrors.channel ? " field--error" : ""}`}
                  >
                    <ChannelSelect
                      id="channel"
                      label="Alarm channel"
                      value={draft.channel}
                      channels={channels}
                      onChange={(value) => setField("channel", value)}
                      hint="Where the alarm notification will be sent."
                      allowUnset={false}
                    />
                    {draftErrors.channel ? (
                      <p className="field__error">{draftErrors.channel}</p>
                    ) : null}
                  </div>
                  <div
                    className={`field${draftErrors.role ? " field--error" : ""}`}
                  >
                    <RoleSelect
                      id="role"
                      label="Alarm ping role"
                      value={draft.role}
                      roles={roles}
                      onChange={(value) => setField("role", value)}
                      hint="Role that will be pinged when the alarm triggers."
                      allowUnset={false}
                    />
                    {draftErrors.role ? (
                      <p className="field__error">{draftErrors.role}</p>
                    ) : null}
                  </div>
                </div>

                <div className="alarm-form-row alarm-form-row--coords">
                  <NumberField
                    label="X coordinate"
                    value={draft.origin.x}
                    min={0}
                    max={mapDefinition.worldWidth}
                    onChange={(value) => setOriginField("x", value)}
                    required={true}
                    error={draftErrors.originX}
                  />

                  <NumberField
                    label="Y coordinate"
                    value={draft.origin.y}
                    min={0}
                    max={mapDefinition.worldHeight}
                    onChange={(value) => setOriginField("y", value)}
                    required={true}
                    error={draftErrors.originY}
                  />
                </div>

                <div className="alarm-form-row">
                  <NumberField
                    label="Radius (meters)"
                    value={draft.radius}
                    min={1}
                    max={5000}
                    onChange={setRadius}
                    required={true}
                    error={draftErrors.radius}
                  />

                  <div
                    className={`field${draftErrors.color ? " field--error" : ""}`}
                  >
                    <span className="field__label">Zone color</span>
                    <p className="field__hint">
                      Used for the map preview and overview display.
                    </p>

                    <div className="alarm-color-grid">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`alarm-color-swatch${draft.color === color ? " is-selected" : ""}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setField("color", color)}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>

                    {draftErrors.color ? (
                      <p className="field__error">{draftErrors.color}</p>
                    ) : null}
                  </div>
                </div>

                <div className="alarm-form-row alarm-form-row--full">
                  <div className="alarm-switch-grid">
                    <Switch
                      label="EMP exempt"
                      checked={Boolean(draft.emp_exempt)}
                      hint="Prevent this alarm from being disabled by EMPs."
                      onChange={(checked) => setField("emp_exempt", checked)}
                    />

                    <Switch
                      label="Show player coords"
                      checked={Boolean(draft.show_player_coords)}
                      hint="Include player coordinates in the alert."
                      onChange={(checked) =>
                        setField("show_player_coords", checked)
                      }
                    />

                    <Switch
                      label="Disabled on create"
                      checked={Boolean(draft.disabled)}
                      hint="Create the alarm without activating it immediately."
                      onChange={(checked) => setField("disabled", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="alarm-create-sidebar">
                <div className="alarm-create-summary">
                  <h3>Draft preview</h3>
                  <p className="muted-text">
                    Review the alarm before creating it.
                  </p>

                  <div className="alarm-create-summary__list">
                    <div className="alarm-create-summary__row">
                      <span>Name</span>
                      <strong>{draft.name.trim() || "Not set"}</strong>
                    </div>

                    <div className="alarm-create-summary__row">
                      <span>Coordinate</span>
                      <strong>
                        {draft.origin.x}, {draft.origin.y}
                      </strong>
                    </div>

                    <div className="alarm-create-summary__row">
                      <span>Radius</span>
                      <strong>{draft.radius}m</strong>
                    </div>

                    <div className="alarm-create-summary__row">
                      <span>Channel</span>
                      <strong>
                        {channels.find(
                          (channel) => channel.id === draft.channel,
                        )?.name || "Not set"}
                      </strong>
                    </div>

                    <div className="alarm-create-summary__row">
                      <span>Role</span>
                      <strong>
                        {roles.find((role) => role.id === draft.role)?.name ||
                          "Not set"}
                      </strong>
                    </div>
                  </div>

                  <div className="alarm-create-actions">
                    <button
                      className="button button--secondary"
                      type="button"
                      onClick={resetDraft}
                      disabled={saving}
                    >
                      Reset draft
                    </button>

                    <button
                      className="button button--primary"
                      type="button"
                      onClick={handleCreateAlarm}
                      disabled={!isDraftValid || saving}
                    >
                      {saving ? "Creating..." : "Create alarm"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <AlarmMap mission={config.nitrado?.mission} zones={[draft]} />
          </div>
        ) : null}

        {activeTab === "manage" ? (
          <div className="form-grid">
            <p className="muted-text">Alarm zone management panel goes here.</p>
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}
