import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/lib/supabase-server';
import { listPublishedTemplates, getTemplateById, purchaseTemplate, getWorkspacePurchases } from '@/engines/marketplace/queries';

export async function GET(req: NextRequest) {
  const { user, error } = await createAuthenticatedClient();
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const workspaceId = url.searchParams.get('workspace_id');

  try {
    if (workspaceId) {
      const [templates, purchases] = await Promise.all([
        listPublishedTemplates(category || undefined),
        getWorkspacePurchases(workspaceId),
      ]);
      const purchasedIds = new Set(purchases.map((p) => p.template_id));
      return NextResponse.json({
        templates: templates.map((t) => ({ ...t, is_purchased: purchasedIds.has(t.id) })),
      });
    }

    const templates = await listPublishedTemplates(category || undefined);
    return NextResponse.json({ templates });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await createAuthenticatedClient();
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { workspace_id, template_id } = body;

    if (!workspace_id || !template_id) {
      return NextResponse.json({ error: 'workspace_id and template_id required' }, { status: 400 });
    }

    const template = await getTemplateById(template_id);
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

    const purchase = await purchaseTemplate(workspace_id, template_id, user.id, template.price_cents);
    return NextResponse.json({ purchase });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
