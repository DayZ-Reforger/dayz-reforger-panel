import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../lib/api";
import { GuildTable } from "../../components/dashboard/GuildTable";
import { SectionCard } from "../../components/dashboard/SectionCard";
import { useAuth } from "../../app/providers/AuthProvider";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type {
  EnrichedGuild,
  GuildConfig,
  NitradoServiceSummary,
  DiscordGuild,
} from "../../lib/types";

export function GuildsPage() {
  const { user, refreshUser } = useAuth();
  const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
  const [linkedGuilds, setLinkedGuilds] = useState<GuildConfig[]>([]);
  const [services, setServices] = useState<NitradoServiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [linkingGuildId, setLinkingGuildId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<
    Record<string, string>
  >({});

  async function load() {
    setLoading(true);
    setError("");

    try {
      const guildsPromise = api.getGuilds();
      const linkedPromise = user?.nitrado
        ? api.getLinkedGuilds().catch((apiError) => {
            if (apiError instanceof ApiError && apiError.status === 400) {
              return { success: true, guilds: [] };
            }
            throw apiError;
          })
        : Promise.resolve({ success: true, guilds: [] });
      const servicesPromise = api.getNitradoServers();

      const [guildsResponse, linkedResponse, servicesResponse] =
        await Promise.all([guildsPromise, linkedPromise, servicesPromise]);

      setGuilds(guildsResponse.guilds);
      setLinkedGuilds(linkedResponse.guilds);
      setServices(servicesResponse.services);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load guilds",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, [user?.nitrado]);

  const enrichedGuilds = useMemo<EnrichedGuild[]>(() => {
    const linkMap = new Map(
      linkedGuilds.map((guild) => [guild.server.server_id, guild]),
    );
    const serviceMap = new Map(
      services.map((service) => [service.linked_guild_id, service]),
    );

    return guilds.map((guild) => {
      const linkedGuild = linkMap.get(guild.id);
      const linkedService = serviceMap.get(guild.id);

      return {
        ...guild,
        linked: Boolean(linkedGuild?.nitrado?.server_id),
        parser_enabled: Boolean(linkedGuild?.active),
        linked_service_id: linkedGuild?.nitrado?.server_id,
        linked_service_name: linkedService?.display_name,
        linked_mission: linkedGuild?.nitrado?.mission,
      };
    });
  }, [guilds, linkedGuilds, services]);

  async function handleLinkGuild(guildId: string) {
    const serviceIdValue = selectedServiceId[guildId];
    if (!serviceIdValue) {
      setError("Choose a Nitrado service before linking the guild.");
      return;
    }

    setLinkingGuildId(guildId);
    setError("");
    setMessage("");

    try {
      await api.linkGuild(guildId, Number(serviceIdValue));
      await refreshUser();
      await load();
      setMessage("Guild linked successfully.");
    } catch (linkError) {
      setError(
        linkError instanceof Error ? linkError.message : "Failed to link guild",
      );
    } finally {
      setLinkingGuildId(null);
    }
  }

  const availableServices = services.filter(
    (service) => !service.linked_guild_id,
  ).length;

  return (
    <div className="page-grid">
      <SectionCard
        title="Guild workspaces"
        description="Link a Nitrado DayZ Services to a guild and manage your configurations"
      >
        <div className="row-between block-gap">
          <StatusBadge tone={user?.nitrado ? "success" : "neutral"}>
            {user?.nitrado
              ? `${availableServices} Nitrado services available to link.`
              : "Link your Nitrado account before you can attach a service to a guild."}
          </StatusBadge>{" "}
          {!user?.nitrado ? (
            <Link className="text-link" to="/dashboard/integrations">
              Open integrations
            </Link>
          ) : null}
        </div>

        {message ? (
          <p className="feedback feedback--success">{message}</p>
        ) : null}
        {error ? <p className="feedback feedback--danger">{error}</p> : null}

        {loading ? (
          <p className="muted-text">Loading guilds...</p>
        ) : (
          <GuildTable
            guilds={enrichedGuilds}
            services={services}
            linkingGuildId={linkingGuildId}
            selectedServiceId={selectedServiceId}
            onSelectService={(guildId, serviceId) => {
              setSelectedServiceId((current) => ({
                ...current,
                [guildId]: serviceId,
              }));
            }}
            onLinkGuild={handleLinkGuild}
          />
        )}
      </SectionCard>
    </div>
  );
}
