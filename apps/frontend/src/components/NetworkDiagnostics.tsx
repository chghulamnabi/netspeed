'use client';

import { useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
interface DiagResult {
  id: string;
  label: string;
  value: string;
  status: 'pass' | 'warn' | 'fail' | 'info';
  detail: string;
  fix?: string;
}

interface Props {
  download: number;
  upload: number;
  latency: number;
  jitter: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const WORKER = 'https://netspeed.nabig151cs.workers.dev';

async function measureDns(): Promise<number> {
  // Measure how long a fetch to a known fast endpoint takes (cold, no cache)
  const url = `${WORKER}/ping?dns=${Date.now()}`;
  const t0 = performance.now();
  try { await fetch(url, { cache: 'no-store', mode: 'cors' }); } catch { /* ignore */ }
  return performance.now() - t0;
}

async function estimatePacketLoss(): Promise<number> {
  // Fire 20 small pings, count failures
  const COUNT = 20;
  let failed = 0;
  const pings = Array.from({ length: COUNT }, async () => {
    try {
      const r = await fetch(`${WORKER}/ping?pl=${Math.random()}`, {
        cache: 'no-store', signal: AbortSignal.timeout(2000),
      });
      if (!r.ok) failed++;
    } catch { failed++; }
  });
  await Promise.all(pings);
  return (failed / COUNT) * 100;
}

function getConnectionType(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigator as any;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  if (!conn) return 'Unknown';
  const type = conn.effectiveType || conn.type || 'Unknown';
  const map: Record<string, string> = {
    'slow-2g': '2G (Slow)', '2g': '2G', '3g': '3G',
    '4g': '4G / LTE', 'wifi': 'Wi-Fi', 'ethernet': 'Ethernet',
    'cellular': 'Cellular', 'bluetooth': 'Bluetooth', 'wimax': 'WiMAX',
    'other': 'Other', 'none': 'Offline', 'unknown': 'Unknown',
  };
  return map[type.toLowerCase()] ?? type;
}

function getRtt(): number | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigator as any;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  return conn?.rtt ?? null;
}

// ── Diagnosis logic ────────────────────────────────────────────────────────
function diagnose(
  download: number,
  upload: number,
  latency: number,
  jitter: number,
  packetLoss: number,
  dnsMs: number,
  connType: string,
): DiagResult[] {
  const results: DiagResult[] = [];

  // 1. Download speed
  if (download >= 100) {
    results.push({ id: 'dl', label: 'Download Speed', value: `${download.toFixed(1)} Mbps`,
      status: 'pass', detail: 'Excellent — suitable for 4K streaming, gaming, and large households.' });
  } else if (download >= 25) {
    results.push({ id: 'dl', label: 'Download Speed', value: `${download.toFixed(1)} Mbps`,
      status: 'pass', detail: 'Good — handles HD streaming, video calls, and remote work.' });
  } else if (download >= 10) {
    results.push({ id: 'dl', label: 'Download Speed', value: `${download.toFixed(1)} Mbps`,
      status: 'warn', detail: 'Moderate — may struggle with 4K streaming or multiple simultaneous users.',
      fix: 'Upgrade your plan or connect via Ethernet. Restart your router and check for background downloads.' });
  } else {
    results.push({ id: 'dl', label: 'Download Speed', value: `${download.toFixed(1)} Mbps`,
      status: 'fail', detail: 'Slow — basic browsing only. Not suitable for HD video or gaming.',
      fix: 'Contact your ISP. Check for line issues, router placement, or interference. Consider upgrading your plan.' });
  }

  // 2. Upload speed
  if (upload >= 20) {
    results.push({ id: 'ul', label: 'Upload Speed', value: `${upload.toFixed(1)} Mbps`,
      status: 'pass', detail: 'Excellent — ideal for live streaming, large file uploads, and video calls.' });
  } else if (upload >= 5) {
    results.push({ id: 'ul', label: 'Upload Speed', value: `${upload.toFixed(1)} Mbps`,
      status: 'pass', detail: 'Good — sufficient for HD video calls and standard uploads.' });
  } else if (upload >= 2) {
    results.push({ id: 'ul', label: 'Upload Speed', value: `${upload.toFixed(1)} Mbps`,
      status: 'warn', detail: 'Low — video calls may be unstable. Live streaming not recommended.',
      fix: 'Use Ethernet instead of Wi-Fi. Close background apps. Check if your ISP plan has low upload limits.' });
  } else {
    results.push({ id: 'ul', label: 'Upload Speed', value: `${upload.toFixed(1)} Mbps`,
      status: 'fail', detail: 'Very low — video calls and file uploads will be severely impacted.',
      fix: 'Switch to a fiber plan for symmetric speeds. Check for ISP throttling or line issues.' });
  }

  // 3. Latency
  if (latency < 20) {
    results.push({ id: 'lat', label: 'Latency (Ping)', value: `${Math.round(latency)} ms`,
      status: 'pass', detail: 'Excellent — ideal for competitive gaming and real-time applications.' });
  } else if (latency < 50) {
    results.push({ id: 'lat', label: 'Latency (Ping)', value: `${Math.round(latency)} ms`,
      status: 'pass', detail: 'Good — suitable for gaming, video calls, and interactive apps.' });
  } else if (latency < 100) {
    results.push({ id: 'lat', label: 'Latency (Ping)', value: `${Math.round(latency)} ms`,
      status: 'warn', detail: 'Noticeable delay — acceptable for streaming but not ideal for gaming.',
      fix: 'Use a wired Ethernet connection. Connect to closer servers. Disable VPN if active.' });
  } else {
    results.push({ id: 'lat', label: 'Latency (Ping)', value: `${Math.round(latency)} ms`,
      status: 'fail', detail: 'High latency — significant lag in games, calls, and interactive apps.',
      fix: 'Switch from Wi-Fi to Ethernet. Check for ISP routing issues. Satellite internet users should expect high latency.' });
  }

  // 4. Jitter
  if (jitter < 5) {
    results.push({ id: 'jit', label: 'Jitter', value: `${Math.round(jitter)} ms`,
      status: 'pass', detail: 'Excellent stability — consistent connection with minimal variation.' });
  } else if (jitter < 20) {
    results.push({ id: 'jit', label: 'Jitter', value: `${Math.round(jitter)} ms`,
      status: 'pass', detail: 'Good — minor variation, acceptable for most applications.' });
  } else if (jitter < 50) {
    results.push({ id: 'jit', label: 'Jitter', value: `${Math.round(jitter)} ms`,
      status: 'warn', detail: 'Unstable — video calls may stutter. Gaming will feel inconsistent.',
      fix: 'Use Ethernet. Reduce Wi-Fi interference. Enable QoS on your router to prioritize traffic.' });
  } else {
    results.push({ id: 'jit', label: 'Jitter', value: `${Math.round(jitter)} ms`,
      status: 'fail', detail: 'Severe instability — calls will drop, games will lag unpredictably.',
      fix: 'Check for faulty cables or router hardware. Contact your ISP about line quality issues.' });
  }

  // 5. Packet loss
  if (packetLoss === 0) {
    results.push({ id: 'pl', label: 'Packet Loss', value: '0%',
      status: 'pass', detail: 'No packet loss detected — all data is arriving intact.' });
  } else if (packetLoss < 1) {
    results.push({ id: 'pl', label: 'Packet Loss', value: `${packetLoss.toFixed(1)}%`,
      status: 'warn', detail: 'Minimal packet loss — barely noticeable in most applications.',
      fix: 'Monitor over time. If persistent, check cables and router firmware.' });
  } else if (packetLoss < 5) {
    results.push({ id: 'pl', label: 'Packet Loss', value: `${packetLoss.toFixed(1)}%`,
      status: 'warn', detail: 'Moderate packet loss — will cause stuttering in calls and games.',
      fix: 'Restart your router. Check Ethernet cables for damage. Contact your ISP.' });
  } else {
    results.push({ id: 'pl', label: 'Packet Loss', value: `${packetLoss.toFixed(1)}%`,
      status: 'fail', detail: 'High packet loss — severe degradation of all real-time applications.',
      fix: 'Immediately contact your ISP. Check all physical connections. Replace damaged cables or router.' });
  }

  // 6. DNS / response time
  if (dnsMs < 50) {
    results.push({ id: 'dns', label: 'Server Response', value: `${Math.round(dnsMs)} ms`,
      status: 'pass', detail: 'Fast server response — low overhead on each connection.' });
  } else if (dnsMs < 150) {
    results.push({ id: 'dns', label: 'Server Response', value: `${Math.round(dnsMs)} ms`,
      status: 'pass', detail: 'Normal server response time.' });
  } else if (dnsMs < 300) {
    results.push({ id: 'dns', label: 'Server Response', value: `${Math.round(dnsMs)} ms`,
      status: 'warn', detail: 'Slow server response — pages may feel sluggish to load.',
      fix: 'Switch DNS to Cloudflare (1.1.1.1) or Google (8.8.8.8) for faster lookups.' });
  } else {
    results.push({ id: 'dns', label: 'Server Response', value: `${Math.round(dnsMs)} ms`,
      status: 'fail', detail: 'Very slow server response — significant overhead on every request.',
      fix: 'Change DNS servers to 1.1.1.1 (Cloudflare) or 8.8.8.8 (Google). Restart your router.' });
  }

  // 7. Connection type (info only)
  const rtt = getRtt();
  results.push({ id: 'conn', label: 'Connection Type', value: connType,
    status: 'info',
    detail: rtt != null
      ? `Detected via Network Information API. Browser-reported RTT: ${rtt}ms.`
      : 'Detected via Network Information API.' });

  // 8. Overall score
  const fails = results.filter(r => r.status === 'fail').length;
  const warns = results.filter(r => r.status === 'warn').length;
  let score = 100 - (fails * 20) - (warns * 8);
  score = Math.max(0, Math.min(100, score));
  const scoreStatus = score >= 80 ? 'pass' : score >= 50 ? 'warn' : 'fail';
  const scoreLabel = score >= 80 ? 'Healthy' : score >= 50 ? 'Issues Detected' : 'Poor Connection';
  results.unshift({ id: 'score', label: 'Overall Health', value: `${score}/100`,
    status: scoreStatus, detail: scoreLabel });

  return results;
}

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  pass: '#00e676', warn: '#ff9100', fail: '#ff1744', info: '#00e5ff',
};
const STATUS_ICON: Record<string, string> = {
  pass: '✓', warn: '⚠', fail: '✕', info: 'ℹ',
};
const STATUS_LABEL: Record<string, string> = {
  pass: 'PASS', warn: 'WARN', fail: 'FAIL', info: 'INFO',
};

// ── Component ──────────────────────────────────────────────────────────────
export default function NetworkDiagnostics({ download, upload, latency, jitter }: Props) {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<DiagResult[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setResults(null);
    setExpanded(null);
    const [packetLoss, dnsMs] = await Promise.all([
      estimatePacketLoss(),
      measureDns(),
    ]);
    const connType = getConnectionType();
    const diag = diagnose(download, upload, latency, jitter, packetLoss, dnsMs, connType);
    setResults(diag);
    setRunning(false);
    // auto-expand first issue
    const firstIssue = diag.find(r => r.status === 'fail' || r.status === 'warn');
    if (firstIssue) setExpanded(firstIssue.id);
  }

  const issueCount = results ? results.filter(r => r.status === 'fail' || r.status === 'warn').length : 0;

  return (
    <div className="diag-wrap">
      <div className="diag-header">
        <div className="diag-title-row">
          <span className="diag-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4l3 3" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="diag-title">Network Diagnostics</span>
          {results && (
            <span className={`diag-badge diag-badge--${issueCount === 0 ? 'pass' : 'warn'}`}>
              {issueCount === 0 ? 'All Clear' : `${issueCount} Issue${issueCount > 1 ? 's' : ''}`}
            </span>
          )}
        </div>
        <p className="diag-sub">
          Analyse your connection for latency, packet loss, jitter, and speed issues — with actionable fixes.
        </p>
      </div>

      <button
        className={`diag-btn${running ? ' diag-btn--running' : ''}`}
        onClick={run}
        disabled={running}
        aria-label="Run network diagnostics"
      >
        {running ? (
          <>
            <span className="diag-spinner" aria-hidden="true" />
            Analysing…
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M9.5 6.5v11l8-5.5z"/>
            </svg>
            {results ? 'Re-run Diagnostics' : 'Run Diagnostics'}
          </>
        )}
      </button>

      {results && (
        <div className="diag-results" role="list">
          {results.map(r => (
            <div
              key={r.id}
              className={`diag-row${expanded === r.id ? ' diag-row--open' : ''}`}
              role="listitem"
            >
              <button
                className="diag-row__head"
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                aria-expanded={expanded === r.id}
              >
                <span
                  className="diag-row__icon"
                  style={{ color: STATUS_COLOR[r.status], borderColor: `${STATUS_COLOR[r.status]}30` }}
                  aria-label={STATUS_LABEL[r.status]}
                >
                  {STATUS_ICON[r.status]}
                </span>
                <span className="diag-row__label">{r.label}</span>
                <span className="diag-row__value" style={{ color: STATUS_COLOR[r.status] }}>
                  {r.value}
                </span>
                <span
                  className="diag-row__tag"
                  style={{
                    color: STATUS_COLOR[r.status],
                    background: `${STATUS_COLOR[r.status]}14`,
                    borderColor: `${STATUS_COLOR[r.status]}30`,
                  }}
                >
                  {STATUS_LABEL[r.status]}
                </span>
                <span className="diag-row__chevron" aria-hidden="true">
                  {expanded === r.id ? '▲' : '▼'}
                </span>
              </button>

              {expanded === r.id && (
                <div className="diag-row__body">
                  <p className="diag-row__detail">{r.detail}</p>
                  {r.fix && (
                    <div className="diag-row__fix">
                      <span className="diag-row__fix-label">How to fix</span>
                      <p className="diag-row__fix-text">{r.fix}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
