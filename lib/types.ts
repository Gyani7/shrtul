export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  is_admin: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export interface Link {
  id: string;
  workspace_id: string | null;
  creator_id: string | null;
  original_url: string;
  alias: string;
  title: string | null;
  description: string | null;
  is_active: boolean;
  password_hash: string | null;
  expires_at: string | null;
  total_clicks: number;
  promo_clicks: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  qr_svg: string | null;
  geo_targets: GeoTarget[];
  device_targets: DeviceTarget[];
  is_guest: boolean;
  guest_session_id: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeoTarget {
  country: string;
  url: string;
}

export interface DeviceTarget {
  device: 'mobile' | 'desktop' | 'tablet';
  url: string;
}

export interface Click {
  id: string;
  link_id: string;
  workspace_id: string | null;
  visitor_ip: string | null;
  referer: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  is_promo_redirect: boolean;
  promo_url_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  is_unique: boolean;
  created_at: string;
}

export interface ApiKey {
  id: string;
  workspace_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AbuseFlag {
  id: string;
  user_id: string | null;
  link_id: string | null;
  reason: string;
  severity: string;
  resolved: boolean;
  created_at: string;
}

export interface BlacklistedDomain {
  id: string;
  domain: string;
  reason: string | null;
  created_at: string;
}

export interface PromoUrl {
  id: string;
  url: string;
  name: string;
  description: string | null;
  weight: number;
  is_active: boolean;
  total_sends: number;
  revenue_per_send: number;
  created_at: string;
  updated_at: string;
}

export interface PlatformSettings {
  id: number;
  promo_enabled: boolean;
  redirect_percentage: number;
  max_redirect_percentage: number;
  signup_bonus_clicks: number;
  maintenance_mode: boolean;
  maintenance_message: string;
  site_name: string;
  site_description: string;
  seo_keywords: string;
  donation_url: string;
  coffee_url: string;
  created_at: string;
  updated_at: string;
}

export interface LinkWithStats extends Link {
  clicks?: Click[];
  creator?: Profile;
}

export interface SupportTicket {
  id: string;
  user_id: string | null;
  subject: string;
  message: string;
  status: string;
  priority: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  is_active: boolean;
  is_dismissible: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BannedUser {
  id: string;
  user_id: string;
  reason: string;
  banned_by: string | null;
  banned_at: string;
  unbanned_at: string | null;
}

export interface CreateLinkInput {
  original_url: string;
  alias?: string;
  title?: string;
  description?: string;
  password?: string;
  expires_at?: string | null;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  workspace_id?: string;
  geo_targets?: GeoTarget[];
  device_targets?: DeviceTarget[];
}
