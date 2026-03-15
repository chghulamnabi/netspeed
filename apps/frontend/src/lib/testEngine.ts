import type { TestResult, TestProgress } from '@shared/types';

const PING_COUNT = 10;

/**
 * Measures latency and jitter by sending sequential pings to /api/ping.
 * Returns average round-trip time (latency) and standard deviation (jitter).
 */
export async function measureLatency(): Promise<{ latency: number; jitter: number }> {
  const times: number[] = [];

  for (let i = 0; i < PING_COUNT; i++) {
    const start = performance.now();
    // Use local ping proxy — gives accurate readable RTT unlike no-cors
    await fetch('/api/ping', { cache: 'no-store' });
    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((sum, t) => sum + t, 0) / times.length;

  const variance = times.reduce((sum, t) => sum + (t - avg) ** 2, 0) / times.length;
  const jitter = Math.sqrt(variance);

  return { latency: avg, jitter };
}

const TEST_DURATION_MS = 10_000;
const DOWNLOAD_CHUNK_SIZE = 1 * 1024 * 1024; // 1MB per chunk
const UPLOAD_CHUNK_SIZE = 512 * 1024;         // 512KB per upload chunk
const PARALLEL_STREAMS = 4;                   // parallel connections like speedtest.net

/**
 * Measures download speed using parallel streams for 10 seconds.
 * Each stream continuously fetches chunks from Cloudflare directly.
 * Returns the final average download speed in Mbps.
 */
export async function measureDownload(
  onProgress: (progress: TestProgress) => void
): Promise<number> {
  const startTime = performance.now();
  const deadline = startTime + TEST_DURATION_MS;
  let totalBytes = 0;
  let done = false;

  // One stream worker: keeps fetching until deadline
  async function streamWorker() {
    while (performance.now() < deadline) {
      const res = await fetch(
        `https://speed.cloudflare.com/__down?bytes=${DOWNLOAD_CHUNK_SIZE}`,
        { cache: 'no-store' }
      );
      if (!res.body) break;
      const reader = res.body.getReader();
      while (true) {
        const { done: rdone, value } = await reader.read();
        if (rdone) break;
        totalBytes += value.byteLength;
      }
    }
  }

  // Progress reporter — updates UI every 250ms
  const progressTimer = setInterval(() => {
    if (done) return;
    const elapsed = (performance.now() - startTime) / 1000;
    const currentSpeed = elapsed > 0 ? (totalBytes * 8) / 1_000_000 / elapsed : 0;
    const progress = Math.min(99, Math.round(((performance.now() - startTime) / TEST_DURATION_MS) * 100));
    onProgress({ phase: 'download', progress, currentSpeed });
  }, 250);

  // Run parallel streams
  await Promise.all(Array.from({ length: PARALLEL_STREAMS }, streamWorker));

  done = true;
  clearInterval(progressTimer);

  const totalElapsed = (performance.now() - startTime) / 1000;
  const avgSpeed = totalElapsed > 0 ? (totalBytes * 8) / 1_000_000 / totalElapsed : 0;
  onProgress({ phase: 'download', progress: 100, currentSpeed: avgSpeed });
  return avgSpeed;
}

/**
 * Measures upload speed using parallel streams for 10 seconds.
 * Returns the final average upload speed in Mbps.
 */
export async function measureUpload(
  onProgress: (progress: TestProgress) => void
): Promise<number> {
  // Pre-generate one chunk of random data to reuse across all workers
  const chunk = new Uint8Array(UPLOAD_CHUNK_SIZE);
  const MAX_RANDOM = 65536;
  for (let offset = 0; offset < UPLOAD_CHUNK_SIZE; offset += MAX_RANDOM) {
    crypto.getRandomValues(chunk.subarray(offset, Math.min(offset + MAX_RANDOM, UPLOAD_CHUNK_SIZE)));
  }

  const startTime = performance.now();
  const deadline = startTime + TEST_DURATION_MS;
  let totalBytes = 0;
  let done = false;

  async function uploadWorker() {
    while (performance.now() < deadline) {
      await fetch('/api/upload', {
        method: 'POST',
        body: chunk,
        cache: 'no-store',
        headers: { 'Content-Type': 'application/octet-stream' },
      });
      totalBytes += chunk.byteLength;
    }
  }

  const progressTimer = setInterval(() => {
    if (done) return;
    const elapsed = (performance.now() - startTime) / 1000;
    const currentSpeed = elapsed > 0 ? (totalBytes * 8) / 1_000_000 / elapsed : 0;
    const progress = Math.min(99, Math.round(((performance.now() - startTime) / TEST_DURATION_MS) * 100));
    onProgress({ phase: 'upload', progress, currentSpeed });
  }, 250);

  await Promise.all(Array.from({ length: PARALLEL_STREAMS }, uploadWorker));

  done = true;
  clearInterval(progressTimer);

  const totalElapsed = (performance.now() - startTime) / 1000;
  const avgSpeed = totalElapsed > 0 ? (totalBytes * 8) / 1_000_000 / totalElapsed : 0;
  onProgress({ phase: 'upload', progress: 100, currentSpeed: avgSpeed });
  return avgSpeed;
}

export type { TestResult, TestProgress };
