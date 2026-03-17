import { NextRequest, NextResponse } from 'next/server';

// Allow up to 4MB body (Vercel Hobby limit is 4.5MB)
export const config = {
  api: { bodyParser: { sizeLimit: '4mb' } },
};

export async function POST(request: NextRequest) {
  // Drain and discard the body — we only need the server to ACK receipt
  if (request.body) {
    const reader = request.body.getReader();
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }
  }
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
