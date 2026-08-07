import { supabaseServer } from '@/lib/supabase-server';
import type { Plugin, CreatePluginInput } from './types';

export async function getWorkspacePlugins(workspaceId: string): Promise<Plugin[]> {
  const { data, error } = await supabaseServer()
    .from('plugins')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('installed_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Plugin[]) || [];
}

export async function installPlugin(input: CreatePluginInput): Promise<Plugin> {
  const { data, error } = await supabaseServer()
    .from('plugins')
    .insert({
      workspace_id: input.workspace_id,
      plugin_key: input.plugin_key,
      name: input.name || input.plugin_key,
      version: input.version || '1.0.0',
      config: input.config || {},
      is_enabled: input.is_enabled ?? true,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Plugin;
}

export async function updatePlugin(
  id: string,
  updates: Partial<Pick<Plugin, 'config' | 'is_enabled' | 'name'>>
): Promise<Plugin> {
  const { data, error } = await supabaseServer()
    .from('plugins')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Plugin;
}

export async function uninstallPlugin(id: string): Promise<void> {
  const { error } = await supabaseServer()
    .from('plugins')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}
