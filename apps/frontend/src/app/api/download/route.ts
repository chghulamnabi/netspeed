import { NextRequest } from 'next/server';

const DEFAULT_SIZE = 256 * 1024; // 256KB
const CHUNK_SIZE = 64 * 1024;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const size = parseInt(searchParams.get('size') ?? String(DEFAULT_SIZE), 10);

  let bytesSent = 0;
  const stream = new ReadableStream({
    pull(controller) {
      if (bytesSent >= size) { controller.close(); return; }
      const chunkSize = Math.min(CHUNK_SIZE, size - bytesSent);
      const chunk = new Uint8Array(chunkSize);
      crypto.getRandomValues(chunk);
      controller.enqueue(chunk);
      bytesSent += chunkSize;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'no-store',
      'Content-Length': String(size),
      'Access-Control-Allow-Origin': '*',
    },
  });
}
