import { Link } from "react-router-dom";
import { getGuildIconUrl } from "../../lib/format";
import type { EnrichedGuild, NitradoServiceSummary } from "../../lib/types";
import { StatusBadge } from "../ui/StatusBadge";

interface Props {
  guilds: EnrichedGuild[];
  services: NitradoServiceSummary[];
  linkingGuildId: string | null;
  selectedServiceId: Record<string, string>;
  onSelectService: (guildId: string, serviceId: string) => void;
  onLinkGuild: (guildId: string) => void;
}

export function GuildTable({
  guilds,
  services,
  linkingGuildId,
  selectedServiceId,
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
                    </div>
                  ) : availableServices.length > 0 ? (
                    <select
                      className="table-select"
                      value={currentServiceId}
                      onChange={(event) =>
                        onSelectService(guild.id, event.target.value)
                      }
                    >
                      <option value="">Choose service</option>
                      {availableServices.map((service) => (
                        <option key={service.id} value={String(service.id)}>
                          {service.display_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="muted-text">No available services</span>
                  )}
                </td>
                <td className="table-actions">
                  {guild.linked ? (
                    <Link
                      className="action-link"
                      to={`/dashboard/guilds/${guild.id}`}
                    >
                      Open workspace
                    </Link>
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
