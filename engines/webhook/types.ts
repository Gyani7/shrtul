export interface Webhook {
  id: string;
  workspace_id: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: string;
  payload: Record<string, unknown>;
  response_status: number | null;
  response_body: string | null;
  delivered: boolean;
  attempts: number;
  delivered_at: string | null;
  created_at: string;
}

export type WebhookEvent =
  | 'click.created'
  | 'link.created'
  | 'link.updated'
  | 'link.deleted'
  | 'link.expired'
  | 'workspace.member.invited'
  | 'quota.warning';

export interface CreateWebhookInput {
  workspace_id: string;
  url: string;
  events: string[];
  secret?: string;
  is_active?: boolean;
}
