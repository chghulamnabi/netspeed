import type { TestResult, TestProgress } from '@shared/types';

const PING_COUNT = 10;

export async function measureLatency(): Promise<{ latency: number; jitter: number }> {
  const times: number[] = [];
  for (let i = 0; i < PING_COUNT; i++) {
    const start = performance.now();
    // Use Cloudflare's CDN-edge ping — same server we test against
    await fetch('https://speed.cloudflare.com/__down?bytes=0', { cache: 'no-store' });
    times.push(performance.now() - start);
  }
  // Trim top 20% outliers before averaging
  times.sort((a, b) => a - b);
  const trimmed = times.slice(0, Math.ceil(PING_COUNT * 0.8));
  const avg = trimmed.reduce((s, t) => s + t, 0) / trimmed.length;
  const jitter = Math.sqrt(trimmed.reduce((s, t) => s + (t - avg) ** 2, 0) / trimmed.length);
  return { latency: avg, jitter };
}

const TEST_DURATION_MS = 10_000;
const DOWNLOAD_CHUNK_SIZE = 25 * 1024 * 1024; // 25MB — fewer fetches, better saturation
const UPLOAD_CHUNK_SIZE   = 1 * 1024 * 1024;  // 1MB upload chunks
const PARALLEL_STREAMS    = 8;

/** Fill a Uint8Array with random bytes, respecting the 65536-byte getRandomValues limit */
function randomBytes(size: number): Uint8Array {
  const buf = new Uint8Array(size);
  for (let off = 0; off < size; off += 65536) {
    crypto.getRandomValues(buf.subarray(off, Math.min(off + 65536, size)));
  }
  return buf;
}

/**
 * Download: parallel streams from Cloudflare edge for 10s.
 * Uses streaming read so bytes are counted as they arrive.
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
      let res: Response;
      try {
        res = await fetch(
          `https://speed.cloudflare.com/__down?bytes=${DOWNLOAD_CHUNK_SIZE}`,
          { cache: 'no-store' }
        );
      } catch { break; }
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
 * Upload: POST to Cloudflare's __up endpoint (supports CORS).
 * We measure elapsed time from XHR open to upload 'load' event using
 * XHR progress bytes — this is the most accurate client-side method.
 */
export async function measureUpload(
  onProgress: (p: TestProgress) => void
): Promise<number> {
  const startTime = performance.now();
  const deadline  = startTime + TEST_DURATION_MS;
  let totalBytes  = 0;
  let done        = false;

  // Pre-generate one chunk of random data (reused across sends)
  const chunk = randomBytes(UPLOAD_CHUNK_SIZE);
  const buffer = chunk.buffer.slice(0) as ArrayBuffer;

  /**
   * Send one chunk to Cloudflare's upload endpoint.
   * We track bytes via xhr.upload 'progress' events for accuracy —
   * these fire as data leaves the TCP send buffer, not when server acks.
   */
  function sendChunk(): Promise<void> {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://speed.cloudflare.com/__up', true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');

      let lastLoaded = 0;
      xhr.upload.addEventListener('progress', (e) => {
        if (e.loaded > lastLoaded) {
          totalBytes += e.loaded - lastLoaded;
          lastLoaded = e.loaded;
        }
      });

      xhr.upload.addEventListener('load', () => {
        // Catch any remaining bytes not reported by progress
        if (chunk.byteLength > lastLoaded) {
          totalBytes += chunk.byteLength - lastLoaded;
        }
        resolve();
      });

      xhr.upload.addEventListener('error', () => resolve());
      xhr.upload.addEventListener('abort', () => resolve());

      xhr.send(buffer);
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
