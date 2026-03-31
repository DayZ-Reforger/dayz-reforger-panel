import { useEffect, useMemo, useRef, useState } from "react";
import type { DiscordRole } from "../../lib/types";
import { discordColorToCss } from "../../lib/format";

type Props = {
  id?: string;
  label: string;
  value: string;
  roles: DiscordRole[];
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  includeManaged?: boolean;
  disabled?: boolean;
  allowUnset?: boolean;
};

export function RoleSelect({
  id,
  label,
  value,
  roles,
  onChange,
  placeholder = "Select a role",
  hint,
  includeManaged = false,
  disabled = false,
  allowUnset = true,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const sortedRoles = useMemo(() => {
    return [...roles]
      .filter((role) => includeManaged || !role.managed)
      .sort((a, b) => b.position - a.position);
  }, [roles, includeManaged]);

  const selectedRole = useMemo(() => {
    return sortedRoles.find((role) => role.id === value) ?? null;
  }, [sortedRoles, value]);

  const selectedColor = selectedRole
    ? discordColorToCss(selectedRole.color)
    : undefined;

  const hasRoleMeta = Boolean(
    selectedRole &&
    (selectedRole.hoist || selectedRole.mentionable || selectedRole.managed),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleToggle(): void {
    if (disabled) {
      return;
    }

    setIsOpen((previous) => !previous);
  }

  function handleSelect(nextValue: string): void {
    onChange(nextValue);
    setIsOpen(false);
  }

  function getTriggerText(): string {
    if (selectedRole) {
      return `@${selectedRole.name}`;
    }

    return placeholder;
  }

  return (
    <div className="role-select field" ref={rootRef}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>

      {hint ? <p className="field__hint">{hint}</p> : null}

      <div className="role-select__control">
        <button
          id={id}
          type="button"
          className={[
            "role-select__trigger",
            isOpen ? "role-select__trigger--open" : "",
          ]
            .join(" ")
            .trim()}
          onClick={handleToggle}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={id ? `${id}-menu` : undefined}
        >
          <span className="role-select__trigger-text">{getTriggerText()}</span>

          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="role-select__caret"
          >
            <path
              d="M5 7.5 10 12.5 15 7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isOpen ? (
          <div
            id={id ? `${id}-menu` : undefined}
            className="role-select__menu"
            role="listbox"
            aria-labelledby={id}
          >
            {allowUnset ? (
              <button
                type="button"
                role="option"
                aria-selected={value === ""}
                className={[
                  "role-select__option",
                  value === "" ? "role-select__option--selected" : "",
                ]
                  .join(" ")
                  .trim()}
                onClick={() => handleSelect("")}
              >
                <span className="role-select__option-label">{placeholder}</span>

                {value === "" ? (
                  <span className="role-select__check">✓</span>
                ) : null}
              </button>
            ) : null}

            {sortedRoles.length > 0 ? (
              sortedRoles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  role="option"
                  aria-selected={value === role.id}
                  className={[
                    "role-select__option",
                    value === role.id ? "role-select__option--selected" : "",
                  ]
                    .join(" ")
                    .trim()}
                  onClick={() => handleSelect(role.id)}
                >
                  <span
                    className="role-select__swatch"
                    style={{
                      backgroundColor:
                        discordColorToCss(role.color) ?? "transparent",
                    }}
                  />

                  <span className="role-select__option-label">
                    @{role.name}
                  </span>

                  {role.managed ? (
                    <span className="role-select__meta">managed</span>
                  ) : null}

                  {value === role.id ? (
                    <span className="role-select__check">✓</span>
                  ) : null}
                </button>
              ))
            ) : (
              <div className="role-select__empty">No roles available</div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
