import { useMemo, useState } from "react";
import type { DiscordChannel } from "../../lib/types";

type Props = {
  label: string;
  hint?: string;
  channels: DiscordChannel[];
  value: string[];
  onChange: (next: string[]) => void;
  maxVisibleSelected?: number;
};

export function ChannelMultiSelect({
  label,
  hint,
  channels,
  value,
  onChange,
  maxVisibleSelected = 8,
}: Props) {
  const [query, setQuery] = useState("");

  const selected = useMemo(() => new Set(value), [value]);

  const filteredChannels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return channels;
    }

    return channels.filter((channel) =>
      channel.name.toLowerCase().includes(normalizedQuery),
    );
  }, [channels, query]);

  const selectedChannels = useMemo(() => {
    return channels.filter((channel) => selected.has(channel.id));
  }, [channels, selected]);

  const visibleSelectedChannels = selectedChannels.slice(0, maxVisibleSelected);
  const hiddenSelectedCount = Math.max(
    0,
    selectedChannels.length - visibleSelectedChannels.length,
  );

  function toggleChannel(id: string): void {
    const next = new Set(value);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    onChange(Array.from(next));
  }

  return (
    <div className="field channel-multi-select">
      <label className="field__label">{label}</label>
      {hint ? <p className="field__hint">{hint}</p> : null}

      <div className="channel-multi-select__selected">
        {selectedChannels.length > 0 ? (
          <>
            {visibleSelectedChannels.map((channel) => (
              <button
                key={channel.id}
                type="button"
                className="choice-pill is-selected"
                onClick={() => toggleChannel(channel.id)}
              >
                <span className="choice-pill__prefix">#</span>
                <span>{channel.name}</span>
              </button>
            ))}

            {hiddenSelectedCount > 0 ? (
              <div className="choice-pill choice-pill--summary">
                <span>+{hiddenSelectedCount} more</span>
              </div>
            ) : null}
          </>
        ) : (
          <div className="channel-multi-select__empty">
            No channels selected
          </div>
        )}
      </div>

      <div className="channel-multi-select__search-wrap">
        <input
          type="text"
          className="channel-multi-select__search"
          placeholder="Search channels..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="choice-list channel-multi-select__list">
        {filteredChannels.length > 0 ? (
          filteredChannels.map((channel) => {
            const active = selected.has(channel.id);

            return (
              <button
                key={channel.id}
                type="button"
                className={`choice-pill${active ? " is-selected" : ""}`}
                onClick={() => toggleChannel(channel.id)}
              >
                <span className="choice-pill__prefix">#</span>
                <span>{channel.name}</span>
              </button>
            );
          })
        ) : (
          <div className="channel-multi-select__empty">
            No channels match your search
          </div>
        )}
      </div>
    </div>
  );
}
