import type { DiscordGuild } from "./types";

export function discordColorToCss(color: number): string | undefined {
  if (!color || color <= 0) {
    return undefined;
  }

  return `#${color.toString(16).padStart(6, "0")}`;
}

export function getDiscordAvatarUrl(discordId?: string, avatar?: string) {
  if (!discordId || !avatar) {
    return "";
  }

  return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png?size=128`;
}

export function getGuildIconUrl(guild: DiscordGuild) {
  if (!guild.icon) {
    return "";
  }

  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`;
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatChecklistLabel(ok: boolean) {
  return ok ? "Ready" : "Needs setup";
}
