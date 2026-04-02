import { Link } from "react-router-dom";
import { getGuildIconUrl } from "../../lib/format";
import type { EnrichedGuild, NitradoServiceSummary } from "../../lib/types";
import { StatusBadge } from "../ui/StatusBadge";
import { ServiceSelect } from "../forms/ServiceSelect";

type GuildBotSetupState = {
  botPresent: boolean;
  inviteUrl?: string;
};

interface Props {
  origin: string;
  guilds: EnrichedGuild[];
  services: NitradoServiceSummary[];
  linkingGuildId: string | null;
  selectedServiceId: Record<string, string>;
  botSetupByGuildId: Record<string, GuildBotSetupState>;
  onSelectService: (guildId: string, serviceId: string) => void;
  onLinkGuild: (guildId: string) => void;
}

export function GuildTable({
  origin,
  guilds,
  services,
  linkingGuildId,
  selectedServiceId,
  botSetupByGuildId,
  onSelectService,
  onLinkGuild,
}: Props) {
  const availableServices = services.filter(
    (service) => !service.linked_guild_id,
  );

  return (
    <div className="table-shell">
      <table className="data-table">
        <thead>
          <tr>
            <th>Guild</th>
            <th>Link state</th>
            <th>Parser</th>
            <th>Service</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {guilds.map((guild) => {
            const iconUrl = getGuildIconUrl(guild);
            const currentServiceId = selectedServiceId[guild.id] ?? "";
            const botSetup = botSetupByGuildId[guild.id];
            const botMissing = guild.linked && botSetup && !botSetup.botPresent;

            return (
              <tr key={guild.id}>
                <td>
                  <div className="guild-cell">
                    {iconUrl ? (
                      <img
                        className="guild-cell__image"
                        src={iconUrl}
                        alt={guild.name}
                      />
                    ) : (
                      <div className="guild-cell__avatar">
                        {guild.name.slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <strong>{guild.name}</strong>
                      <div className="muted-text">
                        {guild.owner ? "Owner" : "Member"}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <StatusBadge tone={guild.linked ? "success" : "neutral"}>
                    {guild.linked ? "Linked" : "Unlinked"}
                  </StatusBadge>{" "}
                </td>
                <td>
                  <StatusBadge
                    tone={guild.parser_enabled ? "success" : "neutral"}
                  >
                    {guild.parser_enabled ? "Active" : "Inactive"}
                  </StatusBadge>
                </td>
                <td>
                  {guild.linked ? (
                    <div>
                      <strong>
                        {guild.linked_service_name ??
                          `Service ${guild.linked_service_id}`}
                      </strong>
                      <div className="muted-text">
                        {guild.linked_mission || "Mission pending"}
                      </div>

                      {botMissing ? (
                        <div className="guild-service-cell__setup-warning">
                          <span className="status-badge status-badge--warning">
                            Bot missing
                          </span>

                          {botSetup?.inviteUrl ? (
                            <a
                              className="action-link action-link--warning"
                              href={botSetup.inviteUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Invite bot
                            </a>
                          ) : null}
                        </div>
                      ) : guild.linked ? (
                        <div className="guild-service-cell__setup-warning">
                          <span className="status-badge status-badge--success">
                            Bot invited
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ) : availableServices.length > 0 ? (
                    <ServiceSelect
                      id={`service-${guild.id}`}
                      value={currentServiceId}
                      services={availableServices.map((service) => ({
                        id: String(service.id),
                        label: service.display_name,
                        linkedGuildId:
                          service.linked_guild_id &&
                          service.linked_guild_id !== guild.id
                            ? service.linked_guild_id
                            : undefined,
                      }))}
                      onChange={(nextValue) =>
                        onSelectService(guild.id, nextValue)
                      }
                      placeholder="Choose service"
                    />
                  ) : (
                    <span className="muted-text">No available services</span>
                  )}
                </td>
                <td className="table-actions">
                  {guild.linked ? (
                    botMissing && botSetup?.inviteUrl ? (
                      <div className="table-actions__stack">
                        <a
                          className="button button--primary button--sm"
                          href={botSetup.inviteUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Invite bot
                        </a>

                        <Link
                          className="action-link"
                          to={
                            origin == "guilds"
                              ? `/dashboard/guilds/${guild.id}`
                              : `/dashboard/alarms/${guild.id}`
                          }
                        >
                          Open workspace
                        </Link>
                      </div>
                    ) : (
                      <Link
                        className="action-link"
                        to={
                          origin == "guilds"
                            ? `/dashboard/guilds/${guild.id}`
                            : `/dashboard/alarms/${guild.id}`
                        }
                      >
                        Open workspace
                      </Link>
                    )
                  ) : (
                    <button
                      className="button button--secondary button--sm"
                      disabled={
                        !currentServiceId || linkingGuildId === guild.id
                      }
                      onClick={() => onLinkGuild(guild.id)}
                    >
                      {linkingGuildId === guild.id
                        ? "Linking..."
                        : "Link service"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
