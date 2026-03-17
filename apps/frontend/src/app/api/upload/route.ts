import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Drain and discard the body as fast as possible
  // We don't proxy to Cloudflare — upload speed is measured client-side via XHR upload events
  if (request.body) {
    const reader = request.body.getReader();
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }
  }
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
