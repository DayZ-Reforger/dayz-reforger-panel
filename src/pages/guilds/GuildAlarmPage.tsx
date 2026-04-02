import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import type { GuildConfig, AlarmZone } from "../../lib/types";
import { SectionCard } from "../../components/dashboard/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { AlarmMap } from "../../components/dashboard/AlarmMap";

const TAB_LABELS = ["overview", "create", "manage"] as const;

type WorkspaceTab = (typeof TAB_LABELS)[number];

function getSafeTab(value: string | null): WorkspaceTab {
  if (value && TAB_LABELS.includes(value as WorkspaceTab)) {
    return value as WorkspaceTab;
  }

  return "overview";
}

export function GuildAlarmPage() {
  const { guildId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = getSafeTab(searchParams.get("tab"));

  const [config, setConfig] = useState<GuildConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const configResponse = await api.getGuildConfig(guildId);
        setConfig(configResponse);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load alarm workspace",
        );
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

  if (!config) {
    return (
      <SectionCard title="Alarm workspace" description={`Guild ${guildId}`}>
        <p className="feedback feedback--danger">
          {error || "Guild not found."}
        </p>
      </SectionCard>
    );
  }

  const zones: AlarmZone[] = [
    {
      id: "1",
      origin: { x: 7792.5, y: 7875.0 },
      radius: 400,
      name: "Test Zone",
      channel: "",
      role: "",
      ignoredPlayers: [],
      rules: [],
      empExempt: false,
      showPlayerCoord: false,
      disabled: false,
      empExpire: null,
      color: "#f08c2e",
    },
  ];

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
          </div>
        </div>

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
            <AlarmMap mission={config.nitrado?.mission} zones={zones} />
          </div>
        ) : null}

        {activeTab === "create" ? (
          <div className="form-grid">
            <p className="muted-text">Alarm zone creation panel goes here.</p>
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
