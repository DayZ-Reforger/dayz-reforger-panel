import { useMemo, useState } from "react";
import type { DiscordRole } from "../../lib/types";
import { discordColorToCss } from "../../lib/format";

type Props = {
  label: string;
  hint?: string;
  roles: DiscordRole[];
  value: string[];
  onChange: (next: string[]) => void;
  maxVisibleSelected?: number;
  includeManaged?: boolean;
};

export function RoleMultiSelect({
  label,
  hint,
  roles,
  value,
  onChange,
  maxVisibleSelected = 8,
  includeManaged = false,
}: Props) {
  const [query, setQuery] = useState("");

  const selected = useMemo(() => new Set(value), [value]);

  const sortedRoles = useMemo(() => {
    return [...roles]
      .filter((role) => includeManaged || !role.managed)
      .sort((a, b) => b.position - a.position);
  }, [roles, includeManaged]);

  const filteredRoles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return sortedRoles;
    }

    return sortedRoles.filter((role) =>
      role.name.toLowerCase().includes(normalizedQuery),
    );
  }, [sortedRoles, query]);

  const selectedRoles = useMemo(() => {
    return sortedRoles.filter((role) => selected.has(role.id));
  }, [sortedRoles, selected]);

  const visibleSelectedRoles = selectedRoles.slice(0, maxVisibleSelected);
  const hiddenSelectedCount = Math.max(
    0,
    selectedRoles.length - visibleSelectedRoles.length,
  );

  function toggleRole(id: string): void {
    const next = new Set(value);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    onChange(Array.from(next));
  }

  return (
    <div className="field role-multi-select">
      <label className="field__label">{label}</label>
      {hint ? <p className="field__hint">{hint}</p> : null}

      <div className="role-multi-select__selected">
        {selectedRoles.length > 0 ? (
          <>
            {visibleSelectedRoles.map((role) => (
              <button
                key={role.id}
                type="button"
                className="role-pill is-selected"
                onClick={() => toggleRole(role.id)}
              >
                <span
                  className="role-pill__swatch"
                  style={{
                    backgroundColor:
                      discordColorToCss(role.color) ?? "transparent",
                  }}
                />
                <span className="role-pill__name">@{role.name}</span>
              </button>
            ))}

            {hiddenSelectedCount > 0 ? (
              <div className="role-pill role-pill--summary">
                <span>+{hiddenSelectedCount} more</span>
              </div>
            ) : null}
          </>
        ) : (
          <div className="role-multi-select__empty">No roles selected</div>
        )}
      </div>

      <div className="role-multi-select__search-wrap">
        <input
          type="text"
          className="role-multi-select__search"
          placeholder="Search roles..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="role-multi-select__list">
        {filteredRoles.length > 0 ? (
          filteredRoles.map((role) => {
            const active = selected.has(role.id);

            return (
              <button
                key={role.id}
                type="button"
                className={`role-pill${active ? " is-selected" : ""}`}
                onClick={() => toggleRole(role.id)}
              >
                <span
                  className="role-pill__swatch"
                  style={{
                    backgroundColor:
                      discordColorToCss(role.color) ?? "transparent",
                  }}
                />
                <span className="role-pill__name">@{role.name}</span>
              </button>
            );
          })
        ) : (
          <div className="role-multi-select__empty">
            No roles match your search
          </div>
        )}
      </div>
    </div>
  );
}
