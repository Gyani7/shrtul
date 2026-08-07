/*
# Phase 7: Advanced Engines — Plugins, Marketplace, Monetization, Notifications, Webhooks

## Summary
Creates all database tables for the Phase 7 advanced engines of the SHRTUL X platform.

## New Tables (9 total)

### Plugin Engine
1. `plugins` — Registry of installed plugins per workspace.
   - `id`, `workspace_id`, `plugin_key`, `name`, `version`, `config` (jsonb), `is_enabled`, `installed_at`, `updated_at`.

### Marketplace Engine
2. `marketplace_templates` — Published experience templates available for install.
   - `id`, `author_id` (nullable — system templates have no author), `template_key` (unique),
   - `name`, `description`, `category`, `icon`, `config_schema` (jsonb), `default_config` (jsonb),
   - `preview_url`, `price_cents`, `is_free`, `is_published`, `install_count`, `rating`, `created_at`, `updated_at`.
3. `marketplace_purchases` — Records of template purchases/installs per workspace.
   - `id`, `workspace_id`, `template_id`, `purchased_by`, `price_paid_cents`, `created_at`.

### Monetization Engine
4. `subscriptions` — Workspace subscription state.
   - `id`, `workspace_id` (unique), `plan`, `status`, `stripe_customer_id`, `stripe_subscription_id`,
   - `current_period_start`, `current_period_end`, `cancel_at_period_end`, `created_at`, `updated_at`.
5. `workspace_quotas` — Monthly quota usage tracking per workspace.
   - `id`, `workspace_id` (unique), `links_created`, `clicks_recorded`, `api_calls`, `custom_domains`,
   - `period_start`, `period_end`, `created_at`, `updated_at`.

### Notification Engine
6. `notifications` — In-app notifications for users.
   - `id`, `user_id`, `workspace_id`, `type`, `title`, `message`, `data` (jsonb), `is_read`, `created_at`.
7. `notification_preferences` — Per-user notification channel preferences.
   - `id`, `user_id` (unique), `email_enabled`, `push_enabled`, `in_app_enabled`,
   - `click_alerts`, `quota_alerts`, `security_alerts`, `product_updates`, `created_at`, `updated_at`.

### Webhook Engine
8. `webhooks` — Webhook endpoint configurations per workspace.
   - `id`, `workspace_id`, `url`, `events` (text[]), `secret`, `is_active`, `created_at`, `updated_at`.
9. `webhook_deliveries` — Log of webhook delivery attempts.
   - `id`, `webhook_id`, `event`, `payload` (jsonb), `response_status`, `response_body`,
   - `delivered`, `attempts`, `delivered_at`, `created_at`.

## Security
- All tables have RLS enabled.
- Workspace-scoped tables use ownership via workspace_members subquery.
- User-scoped tables use auth.uid() = user_id.
- Marketplace templates readable by all authenticated users (published ones).
- All policies use 4 separate CRUD policies, never FOR ALL.

## Notes
1. `marketplace_templates.author_id` is nullable to allow system-seeded templates with no author.
2. 13 experience templates seeded as system templates.
3. All tables use IF NOT EXISTS for idempotency.
*/

-- ========== PLUGIN ENGINE ==========

CREATE TABLE IF NOT EXISTS plugins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  plugin_key text NOT NULL,
  name text NOT NULL DEFAULT '',
  version text NOT NULL DEFAULT '1.0.0',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_enabled boolean NOT NULL DEFAULT true,
  installed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, plugin_key)
);
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_plugins_workspace ON plugins(workspace_id);

DROP POLICY IF EXISTS "select_own_plugins" ON plugins;
CREATE POLICY "select_own_plugins" ON plugins FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = plugins.workspace_id AND workspace_members.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_own_plugins" ON plugins;
CREATE POLICY "insert_own_plugins" ON plugins FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = plugins.workspace_id AND workspace_members.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "update_own_plugins" ON plugins;
CREATE POLICY "update_own_plugins" ON plugins FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = plugins.workspace_id AND workspace_members.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = plugins.workspace_id AND workspace_members.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "delete_own_plugins" ON plugins;
CREATE POLICY "delete_own_plugins" ON plugins FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = plugins.workspace_id AND workspace_members.user_id = auth.uid())
  );

-- ========== MARKETPLACE ENGINE ==========

CREATE TABLE IF NOT EXISTS marketplace_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  template_key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'engagement',
  icon text NOT NULL DEFAULT 'Sparkles',
  config_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  default_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_url text,
  price_cents integer NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT true,
  is_published boolean NOT NULL DEFAULT true,
  install_count integer NOT NULL DEFAULT 0,
  rating numeric(3,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE marketplace_templates ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_marketplace_category ON marketplace_templates(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_published ON marketplace_templates(is_published);

DROP POLICY IF EXISTS "select_published_templates" ON marketplace_templates;
CREATE POLICY "select_published_templates" ON marketplace_templates FOR SELECT
  TO authenticated USING (is_published = true OR author_id = auth.uid());
DROP POLICY IF EXISTS "insert_own_templates" ON marketplace_templates;
CREATE POLICY "insert_own_templates" ON marketplace_templates FOR INSERT
  TO authenticated WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "update_own_templates" ON marketplace_templates;
CREATE POLICY "update_own_templates" ON marketplace_templates FOR UPDATE
  TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "delete_own_templates" ON marketplace_templates;
CREATE POLICY "delete_own_templates" ON marketplace_templates FOR DELETE
  TO authenticated USING (author_id = auth.uid());

CREATE TABLE IF NOT EXISTS marketplace_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  purchased_by uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  price_paid_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, template_id)
);
ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_purchases_workspace ON marketplace_purchases(workspace_id);

DROP POLICY IF EXISTS "select_own_purchases" ON marketplace_purchases;
CREATE POLICY "select_own_purchases" ON marketplace_purchases FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = marketplace_purchases.workspace_id AND workspace_members.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_own_purchases" ON marketplace_purchases;
CREATE POLICY "insert_own_purchases" ON marketplace_purchases FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = marketplace_purchases.workspace_id AND workspace_members.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "delete_own_purchases" ON marketplace_purchases;
CREATE POLICY "delete_own_purchases" ON marketplace_purchases FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = marketplace_purchases.workspace_id AND workspace_members.user_id = auth.uid())
  );

-- ========== MONETIZATION ENGINE ==========

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace ON subscriptions(workspace_id);

DROP POLICY IF EXISTS "select_own_subscriptions" ON subscriptions;
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = subscriptions.workspace_id AND workspace_members.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_own_subscriptions" ON subscriptions;
CREATE POLICY "insert_own_subscriptions" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = subscriptions.workspace_id AND workspace_members.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "update_own_subscriptions" ON subscriptions;
CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = subscriptions.workspace_id AND workspace_members.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = subscriptions.workspace_id AND workspace_members.user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS workspace_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  links_created integer NOT NULL DEFAULT 0,
  clicks_recorded integer NOT NULL DEFAULT 0,
  api_calls integer NOT NULL DEFAULT 0,
  custom_domains integer NOT NULL DEFAULT 0,
  period_start date NOT NULL DEFAULT date_trunc('month', now())::date,
  period_end date NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE workspace_quotas ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_quotas_workspace ON workspace_quotas(workspace_id);

DROP POLICY IF EXISTS "select_own_quotas" ON workspace_quotas;
CREATE POLICY "select_own_quotas" ON workspace_quotas FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = workspace_quotas.workspace_id AND workspace_members.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "update_own_quotas" ON workspace_quotas;
CREATE POLICY "update_own_quotas" ON workspace_quotas FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = workspace_quotas.workspace_id AND workspace_members.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = workspace_quotas.workspace_id AND workspace_members.user_id = auth.uid())
  );

-- ========== NOTIFICATION ENGINE ==========

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  email_enabled boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT false,
  in_app_enabled boolean NOT NULL DEFAULT true,
  click_alerts boolean NOT NULL DEFAULT true,
  quota_alerts boolean NOT NULL DEFAULT true,
  security_alerts boolean NOT NULL DEFAULT true,
  product_updates boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notif_prefs" ON notification_preferences;
CREATE POLICY "select_own_notif_prefs" ON notification_preferences FOR SELECT
  TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "insert_own_notif_prefs" ON notification_preferences;
CREATE POLICY "insert_own_notif_prefs" ON notification_preferences FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "update_own_notif_prefs" ON notification_preferences;
CREATE POLICY "update_own_notif_prefs" ON notification_preferences FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ========== WEBHOOK ENGINE ==========

CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  url text NOT NULL,
  events text[] NOT NULL DEFAULT '{}',
  secret text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_webhooks_workspace ON webhooks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(workspace_id, is_active) WHERE is_active = true;

DROP POLICY IF EXISTS "select_own_webhooks" ON webhooks;
CREATE POLICY "select_own_webhooks" ON webhooks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = webhooks.workspace_id AND workspace_members.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_own_webhooks" ON webhooks;
CREATE POLICY "insert_own_webhooks" ON webhooks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = webhooks.workspace_id AND workspace_members.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "update_own_webhooks" ON webhooks;
CREATE POLICY "update_own_webhooks" ON webhooks FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = webhooks.workspace_id AND workspace_members.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = webhooks.workspace_id AND workspace_members.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "delete_own_webhooks" ON webhooks;
CREATE POLICY "delete_own_webhooks" ON webhooks FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = webhooks.workspace_id AND workspace_members.user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_status integer,
  response_body text,
  delivered boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_created ON webhook_deliveries(created_at);

DROP POLICY IF EXISTS "select_own_deliveries" ON webhook_deliveries;
CREATE POLICY "select_own_deliveries" ON webhook_deliveries FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM webhooks
      JOIN workspace_members ON workspace_members.workspace_id = webhooks.workspace_id
      WHERE webhooks.id = webhook_deliveries.webhook_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- ========== UPDATED_AT TRIGGERS ==========

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_plugins_updated ON plugins;
CREATE TRIGGER trg_plugins_updated BEFORE UPDATE ON plugins
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_marketplace_templates_updated ON marketplace_templates;
CREATE TRIGGER trg_marketplace_templates_updated BEFORE UPDATE ON marketplace_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_updated ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_workspace_quotas_updated ON workspace_quotas;
CREATE TRIGGER trg_workspace_quotas_updated BEFORE UPDATE ON workspace_quotas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_notification_preferences_updated ON notification_preferences;
CREATE TRIGGER trg_notification_preferences_updated BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_webhooks_updated ON webhooks;
CREATE TRIGGER trg_webhooks_updated BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ========== SEED MARKETPLACE TEMPLATES ==========

INSERT INTO marketplace_templates (template_key, name, description, category, icon, default_config, is_free)
SELECT 'countdown', 'Countdown Timer', 'Show a countdown before redirecting. Great for launches and time-sensitive content.', 'engagement', 'Timer', '{"duration":5,"message":"Redirecting soon..."}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM marketplace_templates WHERE template_key = 'countdown');

INSERT INTO marketplace_templates (template_key, name, description, category, icon, default_config, is_free)
SELECT 'cta', 'Call to Action', 'Display a bold CTA button before redirect. Boost conversions with compelling copy.', 'conversion', 'MousePointerClick', '{"title":"Continue?","description":"You are being redirected.","buttonText":"Go Now"}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM marketplace_templates WHERE template_key = 'cta');

INSERT INTO marketplace_templates (template_key, name, description, category, icon, default_config, is_free)
SELECT 'animation', 'Loading Animation', 'Play a branded loading animation before redirect. Smooth transitions for premium feel.', 'engagement', 'Loader', '{"type":"pulse","duration":3,"message":"Loading..."}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM marketplace_templates WHERE template_key = 'animation');

INSERT INTO marketplace_templates (template_key, name, description, category, icon, default_config, is_free)
SELECT 'poll', 'Quick Poll', 'Ask a one-question poll before redirect. Engage users and gather insights.', 'informational', 'BarChart3', '{"question":"Did you find this useful?","options":["Yes","No"]}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM marketplace_templates WHERE template_key = 'poll');

INSERT INTO marketplace_templates (template_key, name, description, category, icon, default_config, is_free)
SELECT 'spin-wheel', 'Spin the Wheel', 'Interactive spin wheel with prizes or messages. Gamify the redirect experience.', 'fun', 'Disc', '{"segments":[{"label":"Try Again","color":"#6366f1"},{"label":"Winner!","color":"#10b981"}]}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM marketplace_templates WHERE template_key = 'spin-wheel');

INSERT INTO marketplace_templates (template_key, name, description, category, icon, default_config, is_free)
SELECT 'quiz', 'Quick Quiz', 'Single-question quiz before redirect. Test knowledge and reveal answer.', 'informational', 'HelpCircle', '{"question":"What is 2+2?","options":["3","4","5"],"correctIndex":1,"revealText":"The answer is 4!"}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM marketplace_templates WHERE template_key = 'quiz');

INSERT INTO marketplace_templates (template_key, name, description, category, icon, default_config, is_free)
SELECT 'scratch-card', 'Scratch Card', 'Interactive scratch-to-reveal card. Surprise users with hidden content.', 'fun', 'Gift', '{"hiddenMessage":"You found a surprise!","revealThreshold":50}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM marketplace_templates WHERE template_key = 'scratch-card');

INSERT INTO marketplace_templates (template_key, name, description, category, icon, default_config, is_free)
SELECT 'survey', 'Mini Survey', 'Multi-question survey before redirect. Collect feedback in seconds.', 'informational', 'ClipboardList', '{"questions":[{"id":"q1","text":"How was your experience?","type":"rating"}]}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM marketplace_templates WHERE template_key = 'survey');

INSERT INTO marketplace_templates (template_key, name, description, category, icon, default_config, is_free)
SELECT 'meme', 'Meme Screen', 'Show a funny meme before redirect. Lighten the mood and increase engagement.', 'fun', 'Smile', '{"imageUrl":"","caption":"Loading... please wait","duration":4}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM marketplace_templates WHERE template_key = 'meme');

INSERT INTO marketplace_templates (template_key, name, description, category, icon, default_config, is_free)
SELECT 'video', 'Video Interstitial', 'Play a short video before redirect. Perfect for ads and brand content.', 'engagement', 'Play', '{"videoUrl":"","autoplay":true,"skipAfter":10}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM marketplace_templates WHERE template_key = 'video');

INSERT INTO marketplace_templates (template_key, name, description, category, icon, default_config, is_free)
SELECT 'image', 'Image Reveal', 'Display a full-screen image before redirect. Great for announcements and teasers.', 'engagement', 'Image', '{"imageUrl":"","duration":5,"overlayText":""}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM marketplace_templates WHERE template_key = 'image');

INSERT INTO marketplace_templates (template_key, name, description, category, icon, default_config, is_free)
SELECT 'ai-avatar', 'AI Avatar', 'AI-generated avatar delivers a message before redirect. Futuristic personalization.', 'conversion', 'Bot', '{"message":"Welcome! Taking you to your destination...","avatarStyle":"professional"}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM marketplace_templates WHERE template_key = 'ai-avatar');

INSERT INTO marketplace_templates (template_key, name, description, category, icon, default_config, is_free)
SELECT 'mini-game', 'Mini Game', 'Simple tap-based mini game before redirect. Maximize engagement with play.', 'fun', 'Gamepad2', '{"gameType":"tap","duration":10,"targetScore":10}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM marketplace_templates WHERE template_key = 'mini-game');
