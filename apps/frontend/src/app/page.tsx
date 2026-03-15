'use client';

import { useState, useEffect, useRef } from 'react';
import { measureLatency, measureDownload, measureUpload } from '../lib/testEngine';
import type { TestProgress, TestResult } from '../lib/testEngine';

// ── Arc Gauge ──────────────────────────────────────────────────────────────
function ArcGauge({ value, max, color, size = 150 }: {
  value: number; max: number; color: string; size?: number;
}) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.37;
  const strokeW = size * 0.052;
  const startDeg = -215, endDeg = 35;
  const totalDeg = endDeg - startDeg;
  const circ = (Math.PI * 2 * r * Math.abs(totalDeg)) / 360;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const offset = circ * (1 - pct);

  function pt(deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  function arc(a: number, b: number) {
    const s = pt(a), e = pt(b);
    const large = Math.abs(b - a) > 180 ? 1 : 0;
    return `M${s.x} ${s.y} A${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const filterId = `glow-${color.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg
      width={size}
      height={size * 0.80}
      viewBox={`0 0 ${size} ${size * 0.80}`}
      overflow="visible"
      style={{ display: 'block' }}
    >
      <defs>
        <filter id={filterId} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Track */}
      <path d={arc(startDeg, endDeg)} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={strokeW} strokeLinecap="round" />
      {/* Fill */}
      <path d={arc(startDeg, endDeg)} fill="none"
        stroke={color} strokeWidth={strokeW} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        filter={`url(#${filterId})`}
        style={{ transition: 'stroke-dashoffset 0.45s cubic-bezier(.4,0,.2,1)' }} />
      {/* Value */}
      <text x={cx} y={cy * 0.95} textAnchor="middle" dominantBaseline="middle"
        fontFamily="Orbitron, monospace" fontWeight="900"
        fontSize={size * 0.17} fill="white">
        {value >= 100 ? value.toFixed(0) : value.toFixed(1)}
      </text>
      <text x={cx} y={cy * 1.20} textAnchor="middle"
        fontFamily="Rajdhani, sans-serif" fontSize={size * 0.088}
        fill="rgba(255,255,255,0.32)" letterSpacing="2">
        Mbps
      </text>
    </svg>
  );
}

// ── Progress Ring ──────────────────────────────────────────────────────────
function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const r = 136, circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg className="progress-svg" viewBox="0 0 300 300" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="150" cy="150" r={r} fill="none"
        stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
      <circle cx="150" cy="150" r={r} fill="none"
        stroke={color} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 0.35s ease',
          filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color}50)`,
        }} />
    </svg>
  );
}

// ── Constants ──────────────────────────────────────────────────────────────
const COLORS: Record<string, string> = {
  idle: '#00e5ff', ping: '#00e676',
  download: '#00e5ff', upload: '#d500f9', complete: '#00e676',
};
const LABELS: Record<string, string> = {
  idle: 'READY', ping: 'LATENCY',
  download: 'DOWNLOAD', upload: 'UPLOAD', complete: 'COMPLETE',
};

// ── Page ───────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [prog, setProg] = useState<TestProgress>({ phase: 'idle', progress: 0 });
  const [result, setResult] = useState<TestResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const running = prog.phase !== 'idle' && prog.phase !== 'complete';
  const color = COLORS[prog.phase] ?? '#00e5ff';

  useEffect(() => {
    if (running) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  async function startTest() {
    setResult(null);
    setProg({ phase: 'ping', progress: 0 });
    const { latency, jitter } = await measureLatency();
    setProg({ phase: 'download', progress: 0 });
    const dl = await measureDownload(p => setProg(p));
    setProg({ phase: 'upload', progress: 0 });
    const ul = await measureUpload(p => setProg(p));
    setResult({ downloadSpeed: dl, uploadSpeed: ul, latency, jitter, timestamp: new Date() });
    setProg({ phase: 'complete', progress: 100 });
  }

  const speed = prog.currentSpeed ?? 0;

  return (
    <>
      {/* ── Background ── */}
      <div className="bg-scene">
        <div className="stars" />
        <div className="grid-floor" />
      </div>

      {/* ── Content ── */}
      <div className="page">

        {/* Header */}
        <header className="header">
          <div className="header-title">Speed Test</div>
          <div className="header-sub">Network Diagnostics · Real-time Analysis</div>
        </header>

        {/* Orb */}
        <div className="orb-wrap">
          <div className="ring-outer" />
          <div className="ring-mid" />
          <div className="ring-inner" />

          {prog.phase === 'idle' && (
            <>
              <div className="pulse-ring" />
              <div className="pulse-ring pulse-ring-2" />
              <div className="pulse-ring pulse-ring-3" />
            </>
          )}

          {running && <ProgressRing pct={prog.progress} color={color} />}

          <div
            className={`orb${running ? ' orb--running' : ''}`}
            onClick={!running ? startTest : undefined}
            role="button"
            aria-label={running ? 'Test in progress' : 'Start speed test'}
          >
            {running && <div className="orb-scan" />}

            {running ? (
              <>
                <div className="orb-speed" style={{ color }}>
                  {speed >= 100 ? speed.toFixed(0) : speed.toFixed(1)}
                </div>
                <div className="orb-unit">Mbps</div>
                <div className="orb-label" style={{ color, marginTop: 6 }}>
                  {LABELS[prog.phase]}
                </div>
              </>
            ) : prog.phase === 'complete' ? (
              <>
                <div style={{ color: '#00e676', fontSize: 30, fontFamily: 'Orbitron', fontWeight: 900, lineHeight: 1 }}>✓</div>
                <div className="orb-label" style={{ color: '#00e676', marginTop: 6 }}>DONE</div>
                <div className="orb-label" style={{ fontSize: 8, marginTop: 3, opacity: 0.5 }}>tap to retest</div>
              </>
            ) : (
              <>
                <div className="orb-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill={color}>
                    <polygon points="7,3 21,12 7,21" />
                  </svg>
                </div>
                <div className="orb-label" style={{ marginTop: 8 }}>START</div>
              </>
            )}
          </div>
        </div>

        {/* Phase progress bar */}
        {prog.phase !== 'idle' && (
          <div className="phase-bar">
            <div className="phase-row">
              <span className="phase-name" style={{ color }}>{LABELS[prog.phase]}</span>
              <span className="phase-pct">
                {running ? `${elapsed}s · ` : ''}{prog.progress}%
              </span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{
                width: `${prog.progress}%`,
                background: `linear-gradient(90deg, ${color}50, ${color})`,
                boxShadow: `0 0 10px ${color}80`,
              }} />
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="results-card">
            <div className="results-scan" />
            <div className="results-title">Test Results</div>

            <div className="gauges-row">
              <div className="gauge-wrap">
                <ArcGauge
                  value={result.downloadSpeed}
                  max={Math.max(result.downloadSpeed * 1.4, 50)}
                  color="#00e5ff"
                />
                <span className="gauge-label" style={{ color: '#00e5ff' }}>Download</span>
              </div>
              <div className="gauge-wrap">
                <ArcGauge
                  value={result.uploadSpeed}
                  max={Math.max(result.uploadSpeed * 1.4, 50)}
                  color="#d500f9"
                />
                <span className="gauge-label" style={{ color: '#d500f9' }}>Upload</span>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-box" style={{ borderColor: 'rgba(0,230,118,0.14)' }}>
                <span className="stat-label" style={{ color: '#00e676' }}>Latency</span>
                <span className="stat-value" style={{
                  color: '#00e676',
                  textShadow: '0 0 24px rgba(0,230,118,0.55)',
                }}>
                  {Math.round(result.latency)}
                </span>
                <span className="stat-unit">ms</span>
              </div>
              <div className="stat-box" style={{ borderColor: 'rgba(255,145,0,0.14)' }}>
                <span className="stat-label" style={{ color: '#ff9100' }}>Jitter</span>
                <span className="stat-value" style={{
                  color: '#ff9100',
                  textShadow: '0 0 24px rgba(255,145,0,0.55)',
                }}>
                  {Math.round(result.jitter)}
                </span>
                <span className="stat-unit">ms</span>
              </div>
            </div>

            <div className="results-time">
              {result.timestamp.toLocaleTimeString()} · {result.timestamp.toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
