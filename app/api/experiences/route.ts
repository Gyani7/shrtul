import { NextRequest, NextResponse } from 'next/server';
import { listTemplates, getTemplate } from '@/engines/experience/registry';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');

  if (type) {
    const template = getTemplate(type);
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    return NextResponse.json({ template });
  }

  return NextResponse.json({ templates: listTemplates() });
}
