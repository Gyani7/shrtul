export interface Notification {
  id: string;
  user_id: string;
  workspace_id: string | null;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  click_alerts: boolean;
  quota_alerts: boolean;
  security_alerts: boolean;
  product_updates: boolean;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'click.milestone'
  | 'link.expired'
  | 'quota.warning'
  | 'security.alert'
  | 'product.update'
  | 'team.invite'
  | 'webhook.failed';

export interface CreateNotificationInput {
  user_id: string;
  workspace_id?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}
