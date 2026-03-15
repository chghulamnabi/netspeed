import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Proxy upload to Cloudflare speed test — server-side fetch has no CORS restrictions
  await fetch('https://speed.cloudflare.com/__up', {
    method: 'POST',
    body: request.body,
    headers: { 'Content-Type': 'application/octet-stream' },
    // @ts-expect-error — duplex required for streaming body in Node fetch
    duplex: 'half',
  });

  return NextResponse.json(
    { ok: true, timestamp: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
