import { supabaseServer } from '@/lib/supabase';

const SITE_URL = 'https://shrtul.vercel.app';

export async function GET() {
  try {
    const sb = supabaseServer();
    const { data: links } = await sb
      .from('links')
      .select('alias, original_url, title, created_at')
      .eq('is_active', true)
      .eq('is_guest', false)
      .order('created_at', { ascending: false })
      .limit(100);

    const items = (links || []).map((link: { alias: string; original_url: string; title: string | null; created_at: string }) => `
      <item>
        <title>${escapeXml(link.title || link.alias)}</title>
        <link>${SITE_URL}/${link.alias}</link>
        <guid>${SITE_URL}/${link.alias}</guid>
        <pubDate>${new Date(link.created_at).toUTCString()}</pubDate>
        <description>${escapeXml(link.original_url)}</description>
      </item>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Shrtul — Recent Short Links</title>
    <link>${SITE_URL}</link>
    <description>Recently created short links on Shrtul</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Shrtul</title></channel></rss>', {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
