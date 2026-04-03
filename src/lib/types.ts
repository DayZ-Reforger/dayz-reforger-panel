export interface DiscordRoleColors {
  primary_color: number;
  secondary_color: number | null;
  tertiary_color: number | null;
}

export interface DiscordRole {
  id: string;
  name: string;
  description: string | null;
  permissions: number;
  permissions_new: string;
  position: number;
  color: number;
  colors: DiscordRoleColors | null;
  hoist: boolean;
  managed: boolean;
  mentionable: boolean;
  icon: string | null;
  unicode_emoji: string | null;
  tags?: Record<string, unknown>;
  flags: number;
}

export type DiscordRolesResponse = {
  bot_present: boolean;
  invite_url?: string;
  roles: DiscordRole[];
};

export interface ApiErrorShape {
  error?: string;
  message?: string;
  detail?: string;
}

export interface Account {
  id?: string;
  discord_id: string;
  username: string;
  email: string;
  avatar: string;
  subscription: Subscription;
  instance_addons: InstanceAddons;
  used_instances: number;
  nitrado?: NitradoAuth;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface Subscription {
  plan: string;
  tier_override?: string;
  auto_renew: boolean;
  expires_at?: string | null;
  renews_at?: string | null;
  updated_at?: string;
}

export interface InstanceAddons {
  base_limit: number;
  extra_instances: number;
  instance_override?: number | null;
  auto_renew: boolean;
  expires_at?: string | null;
  renews_at?: string | null;
  updated_at?: string;
  instance_limit: number;
}

export interface NitradoAuth {
  user_id: number;
  email: string;
  country: string;
  expires_at: string;
  linked_at: string;
  updated_at: string;
}

export interface MeResponse {
  user: Account;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  owner: boolean;
  permissions?: number;
  permissions_new?: string;
  features?: string[];
}

export interface GuildsResponse {
  guilds: DiscordGuild[];
}

export interface FactionArmband {
  faction: string;
  armband: string;
}

export interface GuildConfig {
  id?: string;
  owner_id: string;
  server_id: string;
  active: boolean;
  server: GuildAttributes;
  nitrado?: GuildNitradoConfig;
  created_at?: string;
  updated_at?: string;
}

export interface GuildNitradoConfig {
  server_id: number;
  status?: string;
  mission?: string;
}

export type Position = {
  x: number;
  y: number;
};

export type AlarmZone = {
  id: string;
  origin: Position;
  radius: number;
  name: string;
  channel: string;
  role: string;
  ignored_players: string[];
  rules: string[];
  emp_exempt: boolean;
  show_player_coords: boolean;
  disabled: boolean;
  emp_expire: unknown;
  color: string;
};

export interface GuildAttributes {
  server_id: string;
  owner_id: string;
  last_log: string;
  server_name: string;
  auto_restart: boolean;
  show_killfeed_coords: boolean;
  show_killfeed_weapon_icon: boolean;
  enable_purchase_uav: boolean;
  enable_purchase_emp: boolean;
  allowed_command_channels: string[];
  killfeed_channel: string;
  connection_logs_channel: string;
  base_build_logs_channel: string;
  active_players_channel: string;
  active_players_message_id: string;
  welcome_channel: string;
  send_welcome_message: boolean;
  welcome_message: string;
  faction_armbands: Record<string, FactionArmband>;
  used_armbands: string[];
  excluded_roles: string[];
  bot_admin_roles: string[];
  admin_alert_role: string;
  web_admin_user_ids: string[];
  alarms: AlarmZone[];
  events: unknown[];
  uavs: unknown[];
  income_roles: string[];
  income_limit_hours: number;
  starting_balance: number;
  uav_price: number;
  uav_radius_meters: number;
  emp_price: number;
  emp_duration_minutes: number;
  linked_gamertag_role: string;
  member_role: string;
  issue_member_role: boolean;
  combat_log_timer_minutes: number;
  enable_combat_rating: boolean;
}

export interface LinkedGuildsResponse {
  success: boolean;
  guilds: GuildConfig[];
}

export interface GuildLinkResponse {
  success: boolean;
  guild: GuildConfig;
}

export interface GuildConfigUpdateResponse {
  success: boolean;
  message: string;
  server: GuildAttributes;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  parent_id?: string;
  position: number;
}

export interface GuildChannelsResponse {
  bot_present: boolean;
  channels: DiscordChannel[];
  invite_url?: string;
}

export interface ReadinessCheck {
  key: string;
  label: string;
  ok: boolean;
}

export interface GuildReadinessResponse {
  guild_id: string;
  active: boolean;
  ready: boolean;
  checks: ReadinessCheck[];
}

export interface MutationResponse {
  success: boolean;
  message?: string;
}

export interface GuildLinkRequest {
  nitrado_server_id: number;
}

export interface NitradoServiceSummary {
  id: number;
  display_name: string;
  mission?: string;
  nitrado_status?: string;
  linked_guild_id?: string;
  linked_guild_name?: string;
  parser_enabled: boolean;
}

export interface NitradoServicesResponse {
  linked: boolean;
  services: NitradoServiceSummary[];
}

export interface EnrichedGuild extends DiscordGuild {
  linked: boolean;
  parser_enabled: boolean;
  linked_service_id?: number;
  linked_service_name?: string;
  linked_mission?: string;
  readiness?: GuildReadinessResponse;
}
