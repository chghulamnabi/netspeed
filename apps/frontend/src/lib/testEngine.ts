import type { TestResult, TestProgress } from '@shared/types';

const PING_COUNT = 10;

export async function measureLatency(): Promise<{ latency: number; jitter: number }> {
  const times: number[] = [];
  for (let i = 0; i < PING_COUNT; i++) {
    const start = performance.now();
    await fetch('/api/ping', { cache: 'no-store' });
    times.push(performance.now() - start);
  }
  const avg = times.reduce((s, t) => s + t, 0) / times.length;
  const jitter = Math.sqrt(times.reduce((s, t) => s + (t - avg) ** 2, 0) / times.length);
  return { latency: avg, jitter };
}

const TEST_DURATION_MS = 10_000;
// Larger chunks = fewer round-trips = better saturation on fast connections
const DOWNLOAD_CHUNK_SIZE = 4 * 1024 * 1024;  // 4MB
const UPLOAD_CHUNK_SIZE   = 1 * 1024 * 1024;  // 1MB
const PARALLEL_STREAMS    = 6;                 // more parallel = closer to real throughput

/** Fill a Uint8Array with random bytes, respecting the 65536-byte getRandomValues limit */
function randomBytes(size: number): Uint8Array {
  const buf = new Uint8Array(size);
  for (let off = 0; off < size; off += 65536) {
    crypto.getRandomValues(buf.subarray(off, Math.min(off + 65536, size)));
  }
  return buf;
}

/**
 * Download: parallel streams fetching from Cloudflare directly for 10s.
 */
export async function measureDownload(
  onProgress: (p: TestProgress) => void
): Promise<number> {
  const startTime = performance.now();
  const deadline  = startTime + TEST_DURATION_MS;
  let totalBytes  = 0;
  let done        = false;

  async function worker() {
    while (performance.now() < deadline) {
      const res = await fetch(
        `https://speed.cloudflare.com/__down?bytes=${DOWNLOAD_CHUNK_SIZE}`,
        { cache: 'no-store' }
      );
      if (!res.body) break;
      const reader = res.body.getReader();
      while (true) {
        const { done: rd, value } = await reader.read();
        if (rd) break;
        totalBytes += value.byteLength;
        if (performance.now() >= deadline) { reader.cancel(); break; }
      }
    }
  }

  const timer = setInterval(() => {
    if (done) return;
    const elapsed = (performance.now() - startTime) / 1000;
    const speed   = elapsed > 0 ? (totalBytes * 8) / 1e6 / elapsed : 0;
    const pct     = Math.min(99, Math.round(((performance.now() - startTime) / TEST_DURATION_MS) * 100));
    onProgress({ phase: 'download', progress: pct, currentSpeed: speed });
  }, 250);

  await Promise.all(Array.from({ length: PARALLEL_STREAMS }, worker));
  done = true;
  clearInterval(timer);

  const elapsed = (performance.now() - startTime) / 1000;
  const speed   = elapsed > 0 ? (totalBytes * 8) / 1e6 / elapsed : 0;
  onProgress({ phase: 'download', progress: 100, currentSpeed: speed });
  return speed;
}

/**
 * Upload: measure purely client-side send time using XHR's upload progress events.
 * This avoids the Vercel serverless overhead from skewing results — we count bytes
 * as soon as the browser has sent them, not when the server responds.
 */
export async function measureUpload(
  onProgress: (p: TestProgress) => void
): Promise<number> {
  const chunk = randomBytes(UPLOAD_CHUNK_SIZE);

  const startTime = performance.now();
  const deadline  = startTime + TEST_DURATION_MS;
  let totalBytes  = 0;
  let done        = false;

  /**
   * Send one chunk via XHR and resolve as soon as the browser finishes
   * transmitting (xhr.upload 'load' event) — not waiting for server response.
   */
  function sendChunk(): Promise<void> {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');

      // Resolve the moment the browser has finished sending
      xhr.upload.addEventListener('load', () => {
        totalBytes += chunk.byteLength;
        resolve();
      });
      // Also resolve on error/abort so workers don't stall
      xhr.upload.addEventListener('error', () => resolve());
      xhr.upload.addEventListener('abort', () => resolve());
      // Abort server response early — we don't need it
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) xhr.abort();
      };

      xhr.send(chunk.buffer as ArrayBuffer);
    });
  }

  async function worker() {
    while (performance.now() < deadline) {
      await sendChunk();
    }
  }

  const timer = setInterval(() => {
    if (done) return;
    const elapsed = (performance.now() - startTime) / 1000;
    const speed   = elapsed > 0 ? (totalBytes * 8) / 1e6 / elapsed : 0;
    const pct     = Math.min(99, Math.round(((performance.now() - startTime) / TEST_DURATION_MS) * 100));
    onProgress({ phase: 'upload', progress: pct, currentSpeed: speed });
  }, 250);

  await Promise.all(Array.from({ length: PARALLEL_STREAMS }, worker));
  done = true;
  clearInterval(timer);

  const elapsed = (performance.now() - startTime) / 1000;
  const speed   = elapsed > 0 ? (totalBytes * 8) / 1e6 / elapsed : 0;
  onProgress({ phase: 'upload', progress: 100, currentSpeed: speed });
  return speed;
}

export type { TestResult, TestProgress };
