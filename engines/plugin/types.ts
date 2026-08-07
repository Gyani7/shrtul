export interface Plugin {
  id: string;
  workspace_id: string;
  plugin_key: string;
  name: string;
  version: string;
  config: Record<string, unknown>;
  is_enabled: boolean;
  installed_at: string;
  updated_at: string;
}

export interface PluginManifest {
  key: string;
  name: string;
  version: string;
  description: string;
  category: 'analytics' | 'integration' | 'automation' | 'custom';
  configSchema: Record<string, unknown>;
  hooks: string[];
}

export interface PluginContext {
  workspaceId: string;
  userId: string;
  config: Record<string, unknown>;
}

export type PluginHookHandler<T = unknown> = (ctx: PluginContext, data: T) => Promise<void>;

export interface CreatePluginInput {
  workspace_id: string;
  plugin_key: string;
  name?: string;
  version?: string;
  config?: Record<string, unknown>;
  is_enabled?: boolean;
}
