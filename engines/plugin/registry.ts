import type { PluginManifest, PluginHookHandler } from './types';

const manifests = new Map<string, PluginManifest>();
const hooks = new Map<string, Map<string, PluginHookHandler>>();

export function registerPlugin(manifest: PluginManifest): void {
  manifests.set(manifest.key, manifest);
  hooks.set(manifest.key, new Map());
}

export function getPluginManifest(key: string): PluginManifest | undefined {
  return manifests.get(key);
}

export function listPluginManifests(): PluginManifest[] {
  return Array.from(manifests.values());
}

export function registerHook(pluginKey: string, hookName: string, handler: PluginHookHandler): void {
  const pluginHooks = hooks.get(pluginKey);
  if (!pluginHooks) return;
  pluginHooks.set(hookName, handler);
}

export async function executeHook<T>(
  pluginKey: string,
  hookName: string,
  ctx: { workspaceId: string; userId: string; config: Record<string, unknown> },
  data: T
): Promise<void> {
  const pluginHooks = hooks.get(pluginKey);
  if (!pluginHooks) return;
  const handler = pluginHooks.get(hookName);
  if (!handler) return;
  await handler(ctx, data);
}

export const BUILTIN_PLUGINS: PluginManifest[] = [
  {
    key: 'analytics-pro',
    name: 'Analytics Pro',
    version: '1.0.0',
    description: 'Advanced analytics with custom events, funnels, and export.',
    category: 'analytics',
    configSchema: { trackCustomEvents: { type: 'boolean', default: true } },
    hooks: ['click.created', 'link.created'],
  },
  {
    key: 'slack-notify',
    name: 'Slack Notifications',
    version: '1.0.0',
    description: 'Send click and link alerts to a Slack webhook URL.',
    category: 'integration',
    configSchema: { webhookUrl: { type: 'string', required: true } },
    hooks: ['click.created', 'link.expired'],
  },
  {
    key: 'auto-expiry',
    name: 'Auto Expiry',
    version: '1.0.0',
    description: 'Automatically expire links after a set number of days.',
    category: 'automation',
    configSchema: { expiryDays: { type: 'number', default: 30 } },
    hooks: ['link.created'],
  },
];

BUILTIN_PLUGINS.forEach(registerPlugin);
