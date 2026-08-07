export interface MarketplaceTemplate {
  id: string;
  author_id: string | null;
  template_key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  config_schema: Record<string, unknown>;
  default_config: Record<string, unknown>;
  preview_url: string | null;
  price_cents: number;
  is_free: boolean;
  is_published: boolean;
  install_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface MarketplacePurchase {
  id: string;
  workspace_id: string;
  template_id: string;
  purchased_by: string;
  price_paid_cents: number;
  created_at: string;
}

export type TemplateCategory = 'engagement' | 'fun' | 'conversion' | 'informational';
