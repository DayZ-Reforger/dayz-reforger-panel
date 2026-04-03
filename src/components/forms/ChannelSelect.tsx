import { useEffect, useMemo, useRef, useState } from "react";

type ChannelOption = {
  id: string;
  name: string;
};

type ChannelSelectProps = {
  id: string;
  label: string;
  value: string;
  channels: ChannelOption[];
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  allowUnset?: boolean;
  unsetLabel?: string;
};

export function ChannelSelect({
  id,
  label,
  value,
  channels,
  onChange,
  hint,
  placeholder = "Not set",
  disabled = false,
  allowUnset = true,
  unsetLabel = "Not set",
}: ChannelSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedChannel = useMemo(() => {
    return channels.find((channel) => channel.id === value) ?? null;
  }, [channels, value]);

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
    if (selectedChannel) {
      return `#${selectedChannel.name}`;
    }

    return placeholder;
  }

  return (
    <div className="channel-field field" ref={rootRef}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>

      {hint ? <p className="field__hint">{hint}</p> : null}

      <div className="channel-field__control">
        <button
          id={id}
          type="button"
          className={[
            "channel-field__trigger",
            isOpen ? "channel-field__trigger--open" : "",
          ]
            .join(" ")
            .trim()}
          onClick={handleToggle}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={`${id}-menu`}
        >
          <span className="channel-field__trigger-text">
            {getTriggerText()}
          </span>

          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="channel-field__caret"
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
            id={`${id}-menu`}
            className="channel-field__menu"
            role="listbox"
            aria-labelledby={id}
          >
            {allowUnset ? (
              <button
                type="button"
                role="option"
                aria-selected={value === ""}
                className={[
                  "channel-field__option",
                  value === "" ? "channel-field__option--selected" : "",
                ]
                  .join(" ")
                  .trim()}
                onClick={() => handleSelect("")}
              >
                <span className="channel-field__option-label">
                  {unsetLabel}
                </span>

                {value === "" ? (
                  <span className="channel-field__check">✓</span>
                ) : null}
              </button>
            ) : null}

            {channels.length > 0 ? (
              channels.map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  role="option"
                  aria-selected={value === channel.id}
                  className={[
                    "channel-field__option",
                    value === channel.id
                      ? "channel-field__option--selected"
                      : "",
                  ]
                    .join(" ")
                    .trim()}
                  onClick={() => handleSelect(channel.id)}
                >
                  <span className="channel-field__hash">#</span>

                  <span className="channel-field__option-label">
                    {channel.name}
                  </span>

                  {value === channel.id ? (
                    <span className="channel-field__check">✓</span>
                  ) : null}
                </button>
              ))
            ) : (
              <div className="channel-field__empty">No channels available</div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
