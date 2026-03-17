import type { TestResult, TestProgress } from '@shared/types';

// Cloudflare Worker — routes to nearest PoP (Karachi/Lahore for PK users)
const WORKER = 'https://netspeed.nabig151cs.workers.dev';

const PING_COUNT          = 10;
const TEST_DURATION_MS    = 15_000;
const WARMUP_DURATION_MS  = 2_000;
const DOWNLOAD_CHUNK_SIZE = 10 * 1024 * 1024;
const UPLOAD_CHUNK_SIZE   = 10 * 1024 * 1024;
const PARALLEL_STREAMS    = 8;

function randomBytes(size: number): Uint8Array {
  const buf = new Uint8Array(size);
  for (let off = 0; off < size; off += 65536) {
    crypto.getRandomValues(buf.subarray(off, Math.min(off + 65536, size)));
  }
  return buf;
}

export async function measureLatency(): Promise<{ latency: number; jitter: number }> {
  const times: number[] = [];
  for (let i = 0; i < PING_COUNT; i++) {
    const start = performance.now();
    await fetch(`${WORKER}/ping`, { cache: 'no-store' });
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  const trimmed = times.slice(0, Math.ceil(PING_COUNT * 0.8));
  const avg = trimmed.reduce((s, t) => s + t, 0) / trimmed.length;
  const jitter = Math.sqrt(trimmed.reduce((s, t) => s + (t - avg) ** 2, 0) / trimmed.length);
  return { latency: avg, jitter };
}

export async function measureDownload(
  onProgress: (p: TestProgress) => void
): Promise<number> {
  const startTime   = performance.now();
  const warmupEnd   = startTime + WARMUP_DURATION_MS;
  const deadline    = startTime + TEST_DURATION_MS;
  let totalBytes    = 0;
  let countingBytes = false;
  let done          = false;

  async function worker() {
    while (performance.now() < deadline) {
      let res: Response;
      try {
        res = await fetch(`${WORKER}/download?bytes=${DOWNLOAD_CHUNK_SIZE}`, { cache: 'no-store' });
      } catch { break; }
      if (!res.body) break;
      const reader = res.body.getReader();
      while (true) {
        const { done: rd, value } = await reader.read();
        if (rd) break;
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

  function sendChunk(): Promise<void> {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${WORKER}/upload`, true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      let prevLoaded = 0;
      xhr.upload.addEventListener('progress', (e) => {
        const delta = e.loaded - prevLoaded;
        prevLoaded = e.loaded;
        if (delta > 0 && performance.now() >= warmupEnd) totalBytes += delta;
      });
      xhr.upload.addEventListener('load', () => {
        const remaining = UPLOAD_CHUNK_SIZE - prevLoaded;
        if (remaining > 0 && performance.now() >= warmupEnd) totalBytes += remaining;
        resolve();
      });
      xhr.upload.addEventListener('error', () => resolve());
      xhr.upload.addEventListener('abort', () => resolve());
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) xhr.abort();
      };
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