import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../lib/api";
import type { GuildConfig, NitradoServiceSummary } from "../../lib/types";
import { useAuth } from "../../app/providers/AuthProvider";
import { SectionCard } from "../../components/dashboard/SectionCard";
import { SetupChecklist } from "../../components/dashboard/SetupChecklist";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function DashboardOverviewPage() {
  const { user } = useAuth();
  const [linkedGuilds, setLinkedGuilds] = useState<GuildConfig[]>([]);
  const [services, setServices] = useState<NitradoServiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const linkedPromise = user?.nitrado
          ? api.getLinkedGuilds().catch((apiError) => {
              if (apiError instanceof ApiError && apiError.status === 400) {
                return { success: true, guilds: [] };
              }
              throw apiError;
            })
          : Promise.resolve({ success: true, guilds: [] });

        const servicesPromise = api.getNitradoServers();
        const [linkedResponse, servicesResponse] = await Promise.all([
          linkedPromise,
          servicesPromise,
        ]);

        if (!cancelled) {
          setLinkedGuilds(linkedResponse.guilds);
          setServices(servicesResponse.services);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load dashboard overview",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user?.nitrado]);

  const checklist = useMemo(
    () => [
      { label: "Discord account connected", ok: Boolean(user) },
      { label: "Nitrado account linked", ok: Boolean(user?.nitrado) },
      {
        label: "At least one guild linked to a service",
        ok: linkedGuilds.length > 0,
      },
      {
        label: "At least one parser active",
        ok: linkedGuilds.some((guild) => guild.active),
      },
    ],
    [linkedGuilds, user],
  );

  const linkedServices = services.filter((service) => service.linked_guild_id);

  return (
    <div className="page-grid">
      <SectionCard
        title="Setup overview"
        // description="Required acconuts connected, Live account status from the API and the current operational state."
      >
        <div className="stat-grid">
          <div className="stat-panel">
            <span className="stat-panel__label">Discord</span>
            <strong>{user ? "Connected" : "Not connected"}</strong>
          </div>
          <div className="stat-panel">
            <span className="stat-panel__label">Nitrado</span>
            <strong>{user?.nitrado ? "Connected" : "Not linked"}</strong>
          </div>
          <div className="stat-panel">
            <span className="stat-panel__label">Instance usage</span>
            <strong>
              {user
                ? `${user.used_instances} / ${user.instance_addons.instance_limit}`
                : "—"}
            </strong>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Setup checklist"
        description="Get started by completing the following"
      >
        <SetupChecklist items={checklist} />
      </SectionCard>

      <SectionCard
        title="Linked services snapshot"
        description="Quick visibility into already linked Nitrado services."
      >
        {loading ? (
          <p className="muted-text">Loading linked services...</p>
        ) : error ? (
          <p className="feedback feedback--danger">{error}</p>
        ) : linkedServices.length === 0 ? (
          <div className="empty-state">
            <p>
              No Nitrado Service has been linked yet. Connect Nitrado, then link
              one of your services to a Discord guild to get started.
            </p>
            <Link className="action-link" to="/dashboard/guilds">
              Go to guilds
            </Link>
          </div>
        ) : (
          <div className="stack-list">
            {linkedServices.map((service) => (
              <div key={service.id} className="list-row">
                <div>
                  <strong>{service.display_name}</strong>
                  <div className="muted-text">
                    {service.linked_guild_name ?? service.linked_guild_id}
                  </div>
                </div>
                <div className="list-row__actions">
                  <StatusBadge
                    tone={service.parser_enabled ? "success" : "neutral"}
                  >
                    {service.parser_enabled
                      ? "Parser active"
                      : "Parser inactive"}
                  </StatusBadge>
                  <Link
                    className="action-link action-link--compact"
                    to={`/dashboard/guilds/${service.linked_guild_id}`}
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
