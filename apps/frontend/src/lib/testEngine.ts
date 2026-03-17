import type { TestResult, TestProgress } from '@shared/types';

const PING_COUNT = 10;

export async function measureLatency(): Promise<{ latency: number; jitter: number }> {
  const times: number[] = [];
  for (let i = 0; i < PING_COUNT; i++) {
    const start = performance.now();
    await fetch('https://speed.cloudflare.com/__down?bytes=0', { cache: 'no-store' });
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  const trimmed = times.slice(0, Math.ceil(PING_COUNT * 0.8));
  const avg = trimmed.reduce((s, t) => s + t, 0) / trimmed.length;
  const jitter = Math.sqrt(trimmed.reduce((s, t) => s + (t - avg) ** 2, 0) / trimmed.length);
  return { latency: avg, jitter };
}

const TEST_DURATION_MS = 10_000;
const DOWNLOAD_CHUNK_SIZE = 25 * 1024 * 1024; // 25MB
const UPLOAD_CHUNK_SIZE   = 4 * 1024 * 1024;  // 4MB — larger = fewer round-trips to Vercel
const PARALLEL_STREAMS    = 8;

function randomBytes(size: number): Uint8Array {
  const buf = new Uint8Array(size);
  for (let off = 0; off < size; off += 65536) {
    crypto.getRandomValues(buf.subarray(off, Math.min(off + 65536, size)));
  }
  return buf;
}

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
 * Upload accuracy strategy:
 * - Use large chunks (4MB) to amortize Vercel cold-start / RTT overhead
 * - Measure wall-clock time from XHR open → server 200 response (readyState 4)
 * - This is the true end-to-end send time, not the OS buffer flush time
 * - Discard the first chunk (warm-up) to avoid cold-start skew
 */
export async function measureUpload(
  onProgress: (p: TestProgress) => void
): Promise<number> {
  const buffer = randomBytes(UPLOAD_CHUNK_SIZE).buffer.slice(0) as ArrayBuffer;

  const testStart = performance.now();
  const deadline  = testStart + TEST_DURATION_MS;
  let totalBytes  = 0;
  let done        = false;
  let warmedUp    = false;

  function sendChunk(): Promise<number> {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');

      const sendStart = performance.now();

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          // Wall-clock time from send → server ack = true wire time
          const elapsed = (performance.now() - sendStart) / 1000;
          resolve(elapsed > 0 ? UPLOAD_CHUNK_SIZE / elapsed : 0);
        }
      };

      xhr.onerror = () => resolve(0);
      xhr.send(buffer);
    });
  }

  async function worker() {
    // Warm-up: one chunk to establish TCP connection, don't count it
    if (!warmedUp) {
      warmedUp = true;
      await sendChunk();
    }
    while (performance.now() < deadline) {
      const bytesPerSec = await sendChunk();
      if (bytesPerSec > 0) totalBytes += UPLOAD_CHUNK_SIZE;
    }
  }

  const timer = setInterval(() => {
    if (done) return;
    const elapsed = (performance.now() - testStart) / 1000;
    const speed   = elapsed > 0 ? (totalBytes * 8) / 1e6 / elapsed : 0;
    const pct     = Math.min(99, Math.round(((performance.now() - testStart) / TEST_DURATION_MS) * 100));
    onProgress({ phase: 'upload', progress: pct, currentSpeed: speed });
  }, 250);

  await Promise.all(Array.from({ length: PARALLEL_STREAMS }, worker));
  done = true;
  clearInterval(timer);

  const elapsed = (performance.now() - testStart) / 1000;
  const speed   = elapsed > 0 ? (totalBytes * 8) / 1e6 / elapsed : 0;
  onProgress({ phase: 'upload', progress: 100, currentSpeed: speed });
  return speed;
}

export type { TestResult, TestProgress };
