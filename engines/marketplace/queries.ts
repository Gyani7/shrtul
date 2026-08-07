import { supabaseServer } from '@/lib/supabase-server';
import type { MarketplaceTemplate, MarketplacePurchase } from './types';

export async function listPublishedTemplates(category?: string): Promise<MarketplaceTemplate[]> {
  let query = supabaseServer()
    .from('marketplace_templates')
    .select('*')
    .eq('is_published', true)
    .order('install_count', { ascending: false });
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as MarketplaceTemplate[]) || [];
}

export async function getTemplateByKey(key: string): Promise<MarketplaceTemplate | null> {
  const { data, error } = await supabaseServer()
    .from('marketplace_templates')
    .select('*')
    .eq('template_key', key)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as MarketplaceTemplate | null;
}

export async function getTemplateById(id: string): Promise<MarketplaceTemplate | null> {
  const { data, error } = await supabaseServer()
    .from('marketplace_templates')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as MarketplaceTemplate | null;
}

export async function purchaseTemplate(
  workspaceId: string,
  templateId: string,
  userId: string,
  pricePaidCents = 0
): Promise<MarketplacePurchase> {
  const { data, error } = await supabaseServer()
    .from('marketplace_purchases')
    .insert({
      workspace_id: workspaceId,
      template_id: templateId,
      purchased_by: userId,
      price_paid_cents: pricePaidCents,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  await supabaseServer().rpc('increment_install_count', { p_template_id: templateId });
  return data as MarketplacePurchase;
}

export async function getWorkspacePurchases(workspaceId: string): Promise<MarketplacePurchase[]> {
  const { data, error } = await supabaseServer()
    .from('marketplace_purchases')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as MarketplacePurchase[]) || [];
}

export async function hasPurchased(workspaceId: string, templateId: string): Promise<boolean> {
  const { data, error } = await supabaseServer()
    .from('marketplace_purchases')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('template_id', templateId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return !!data;
}
