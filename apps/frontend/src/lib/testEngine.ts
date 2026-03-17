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

const TEST_DURATION_MS  = 15_000; // 15s — more time = more samples = more accurate average
const WARMUP_DURATION_MS = 2_000; // 2s warm-up to establish TCP + fill slow-start window

// Download: 10MB chunks — on 20Mbps each takes ~4s, workers stay busy the full 15s
const DOWNLOAD_CHUNK_SIZE = 10 * 1024 * 1024; // 10MB

// Upload: 3MB — safely under Vercel's 4.5MB body limit
const UPLOAD_CHUNK_SIZE = 3 * 1024 * 1024; // 3MB

const PARALLEL_STREAMS = 8;

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
  const startTime   = performance.now();
  const warmupEnd   = startTime + WARMUP_DURATION_MS;
  const deadline    = startTime + TEST_DURATION_MS;
  let totalBytes    = 0;
  let countingBytes = false; // only count after warm-up
  let done          = false;

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
        // Start counting once warm-up window has passed
        if (performance.now() >= warmupEnd) {
          countingBytes = true;
          totalBytes += value.byteLength;
        }
        if (performance.now() >= deadline) { reader.cancel(); break; }
      }
    }
  }

  const timer = setInterval(() => {
    if (done) return;
    const now     = performance.now();
    const elapsed = Math.max(0, (now - warmupEnd) / 1000);
    const speed   = countingBytes && elapsed > 0 ? (totalBytes * 8) / 1e6 / elapsed : 0;
    const pct     = Math.min(99, Math.round(((now - startTime) / TEST_DURATION_MS) * 100));
    onProgress({ phase: 'download', progress: pct, currentSpeed: speed });
  }, 250);

  await Promise.all(Array.from({ length: PARALLEL_STREAMS }, worker));
  done = true;
  clearInterval(timer);

  const elapsed = Math.max(0.001, (performance.now() - warmupEnd) / 1000);
  const speed   = (totalBytes * 8) / 1e6 / elapsed;
  onProgress({ phase: 'download', progress: 100, currentSpeed: speed });
  return speed;
}

export async function measureUpload(
  onProgress: (p: TestProgress) => void
): Promise<number> {
  const buffer = randomBytes(UPLOAD_CHUNK_SIZE).buffer.slice(0) as ArrayBuffer;

  const testStart  = performance.now();
  const warmupEnd  = testStart + WARMUP_DURATION_MS;
  const deadline   = testStart + TEST_DURATION_MS;
  let totalBytes   = 0;
  let done         = false;

  function sendChunk(): Promise<{ ok: boolean }> {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          resolve({ ok: xhr.status >= 200 && xhr.status < 300 });
        }
      };
      xhr.onerror   = () => resolve({ ok: false });
      xhr.ontimeout = () => resolve({ ok: false });
      xhr.timeout   = 30_000;
      xhr.send(buffer);
    });
  }

  async function worker() {
    while (performance.now() < deadline) {
      const { ok } = await sendChunk();
      // Only count bytes after warm-up window
      if (ok && performance.now() >= warmupEnd) {
        totalBytes += UPLOAD_CHUNK_SIZE;
      }
    }
  }

  const timer = setInterval(() => {
    if (done) return;
    const now     = performance.now();
    const elapsed = Math.max(0, (now - warmupEnd) / 1000);
    const speed   = elapsed > 0 ? (totalBytes * 8) / 1e6 / elapsed : 0;
    const pct     = Math.min(99, Math.round(((now - testStart) / TEST_DURATION_MS) * 100));
    onProgress({ phase: 'upload', progress: pct, currentSpeed: speed });
  }, 250);

  await Promise.all(Array.from({ length: PARALLEL_STREAMS }, worker));
  done = true;
  clearInterval(timer);

  const elapsed = Math.max(0.001, (performance.now() - warmupEnd) / 1000);
  const speed   = (totalBytes * 8) / 1e6 / elapsed;
  onProgress({ phase: 'upload', progress: 100, currentSpeed: speed });
  return speed;
}

export type { TestResult, TestProgress };
