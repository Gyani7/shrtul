import { NextResponse } from 'next/server';

export async function GET() {
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <text x="600" y="260" font-family="sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">Shrtul</text>
  <text x="600" y="330" font-family="sans-serif" font-size="28" fill="#94a3b8" text-anchor="middle">Free URL Shortener with Analytics</text>
  <text x="600" y="380" font-family="sans-serif" font-size="20" fill="#64748b" text-anchor="middle">QR Codes · Password Protection · Click Tracking · Free Forever</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
}
