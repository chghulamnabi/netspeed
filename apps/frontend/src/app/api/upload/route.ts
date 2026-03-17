import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30; // Vercel: allow up to 30s for large uploads

export async function POST(request: NextRequest) {
  if (request.body) {
    const reader = request.body.getReader();
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }
  }
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
