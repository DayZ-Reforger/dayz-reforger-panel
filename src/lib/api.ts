import { tokenStore } from "./tokenStore";
import type {
  ApiErrorShape,
  DiscordChannel,
  GuildAttributes,
  GuildChannelsResponse,
  GuildConfig,
  GuildConfigUpdateResponse,
  GuildLinkResponse,
  GuildReadinessResponse,
  GuildsResponse,
  LinkedGuildsResponse,
  MeResponse,
  MutationResponse,
  NitradoServicesResponse,
  DiscordRole,
  DiscordRolesResponse,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function parseError(response: Response): Promise<ApiError> {
  let message = `API request failed: ${response.status}`;
  let detail: string | undefined;

  try {
    const data = (await response.json()) as ApiErrorShape;
    message = data.error ?? data.message ?? message;
    detail = data.detail;
  } catch {
    try {
      const text = await response.text();
      if (text) {
        message = text;
      }
    } catch {
      // no-op
    }
  }

  return new ApiError(response.status, message, detail);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = tokenStore.get();
  const headers = new Headers(init?.headers ?? {});

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function ensureArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeGuildAttributes(server: GuildAttributes): GuildAttributes {
  return {
    ...server,
    allowed_command_channels: ensureArray(server.allowed_command_channels),
    faction_armbands: server.faction_armbands ?? {},
    used_armbands: ensureArray(server.used_armbands),
    excluded_roles: ensureArray(server.excluded_roles),
    bot_admin_roles: ensureArray(server.bot_admin_roles),
    web_admin_user_ids: ensureArray(server.web_admin_user_ids),
    alarms: ensureArray(server.alarms),
    events: ensureArray(server.events),
    uavs: ensureArray(server.uavs),
    income_roles: ensureArray(server.income_roles),
  };
}

function normalizeGuildConfig(guild: GuildConfig): GuildConfig {
  return {
    ...guild,
    server: normalizeGuildAttributes(guild.server),
  };
}

function normalizeGuildChannelsResponse(
  response: GuildChannelsResponse,
): GuildChannelsResponse {
  return {
    ...response,
    channels: ensureArray<DiscordChannel>(response.channels),
  };
}

function normalizeGuildsResponse(response: GuildsResponse): GuildsResponse {
  return {
    ...response,
    guilds: ensureArray(response.guilds),
  };
}

function normalizeLinkedGuildsResponse(
  response: LinkedGuildsResponse,
): LinkedGuildsResponse {
  return {
    ...response,
    guilds: ensureArray(response.guilds).map(normalizeGuildConfig),
  };
}

function normalizeNitradoServicesResponse(
  response: NitradoServicesResponse,
): NitradoServicesResponse {
  return {
    ...response,
    services: ensureArray(response.services),
  };
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getDiscordLoginUrl() {
  return `${API_BASE_URL}/auth/discord/login`;
}

export function getNitradoLoginUrl(token: string) {
  return `${API_BASE_URL}/auth/nitrado/login?user_token=${encodeURIComponent(token)}`;
}

export const api = {
  getMe: () => request<MeResponse>("/api/auth/me"),
  getGuilds: async () =>
    normalizeGuildsResponse(await request<GuildsResponse>("/api/guilds")),
  getLinkedGuilds: async () =>
    normalizeLinkedGuildsResponse(
      await request<LinkedGuildsResponse>("/api/guilds/linked"),
    ),
  getGuildConfig: async (guildId: string) =>
    normalizeGuildConfig(
      await request<GuildConfig>(`/api/guilds/${guildId}/config`),
    ),
  updateGuildConfig: async (
    guildId: string,
    body: Partial<GuildConfig["server"]>,
  ) => {
    const response = await request<GuildConfigUpdateResponse>(
      `/api/guilds/${guildId}/config`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
    );

    return {
      ...response,
      server: normalizeGuildAttributes(response.server),
    };
  },
  getGuildChannels: async (guildId: string) =>
    normalizeGuildChannelsResponse(
      await request<GuildChannelsResponse>(`/api/guilds/${guildId}/channels`),
    ),
  getGuildReadiness: (guildId: string) =>
    request<GuildReadinessResponse>(`/api/guilds/${guildId}/readiness`),
  activateGuild: (guildId: string) =>
    request<MutationResponse>(`/api/guilds/${guildId}/activate`, {
      method: "POST",
    }),
  deactivateGuild: (guildId: string) =>
    request<MutationResponse>(`/api/guilds/${guildId}/deactivate`, {
      method: "POST",
    }),
  linkGuild: (guildId: string, nitradoServerId: number) =>
    request<GuildLinkResponse>(`/api/guilds/${guildId}/link`, {
      method: "POST",
      body: JSON.stringify({ nitrado_server_id: nitradoServerId }),
    }),
  unlinkGuild: (guildId: string) =>
    request<MutationResponse>(`/api/guilds/${guildId}/unlink`, {
      method: "POST",
    }),
  getNitradoServers: async () =>
    normalizeNitradoServicesResponse(
      await request<NitradoServicesResponse>("/api/nitrado/servers"),
    ),
  unlinkNitrado: () =>
    request<MutationResponse>("/api/nitrado/unlink", { method: "POST" }),

  getDiscordRoles: async (guildId: string) =>
    request<DiscordRolesResponse>(`/api/guilds/${guildId}/roles`),
};
