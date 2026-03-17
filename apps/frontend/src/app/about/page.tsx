import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

const SITE_URL = 'https://speedtest.chghulamnabi.com';

export const metadata: Metadata = {
  title: 'About — Cyber Vision Technologies',
  description: 'NetSpeed is a free internet speed test tool built by Cyber Vision Technologies. Measure download, upload, ping and jitter instantly.',
  alternates: { canonical: `${SITE_URL}/about` },
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Cyber Vision Technologies',
  url: 'https://www.linkedin.com/company/cybervisiontechnologies/',
  sameAs: ['https://www.linkedin.com/company/cybervisiontechnologies/'],
};

const FEATURES = [
  { icon: '⚡', title: 'Real-Time Measurement', desc: 'Live speed tracked every 250ms using 8 parallel streams — no sampling, no averages.' },
  { icon: '🌐', title: 'Global Edge Network', desc: 'Powered by Cloudflare — routes to the nearest PoP for accurate local results worldwide.' },
  { icon: '📡', title: 'Full Diagnostics', desc: 'Latency, jitter, packet loss, and server response — with actionable fix recommendations.' },
  { icon: '🗺️', title: 'Nearby ISP Finder', desc: 'Locate internet providers near you using open map data. No API key required.' },
  { icon: '🔒', title: 'Privacy First', desc: 'No account. No personal data stored. No tracking beyond standard analytics.' },
  { icon: '📱', title: 'Works Everywhere', desc: 'Responsive on all devices. Tests 5G, 4G, fiber, cable, DSL, and satellite.' },
];

const STATS = [
  { value: '190+', label: 'Countries' },
  { value: '15s', label: 'Test Duration' },
  { value: '8×', label: 'Parallel Streams' },
  { value: '100%', label: 'Free Forever' },
];

const TECH = [
  { name: 'Next.js 14', role: 'Frontend', color: '#ffffff' },
  { name: 'Cloudflare Workers', role: 'Edge Compute', color: '#f6821f' },
  { name: 'TypeScript', role: 'Language', color: '#3178c6' },
  { name: 'Vercel', role: 'Deployment', color: '#ffffff' },
  { name: 'Turborepo', role: 'Build System', color: '#ef4444' },
  { name: 'Leaflet + OSM', role: 'Mapping', color: '#00e676' },
];

export default function AboutPage() {
  return (
    <>
      <Script id="org-jsonld" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

      <div className="bg-scene"><div className="stars" /><div className="grid-floor" /></div>

      <main className="ab-page">

        {/* ── HERO ── */}
        <section className="ab-hero">
          <div className="ab-hero__badge">
            <span className="ab-hero__badge-dot" />
            Built by Cyber Vision Technologies
          </div>
          <h1 className="ab-hero__h1">
            <span className="ab-hero__h1-top">NetSpeed</span>
            <span className="ab-hero__h1-sub">Internet Speed Intelligence</span>
          </h1>
          <p className="ab-hero__p">
            A professional-grade, free broadband speed test — engineered for accuracy,
            built for everyone. No sign-up. No paywalls. Just your real connection speed.
          </p>
          <div className="ab-hero__ctas">
            <Link href="/" className="ab-cta ab-cta--primary">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><polygon points="7,3 21,12 7,21"/></svg>
              Run Speed Test
            </Link>
            <a href="https://www.linkedin.com/company/cybervisiontechnologies/"
              target="_blank" rel="noopener noreferrer" className="ab-cta ab-cta--ghost">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            <Link href="/contact" className="ab-cta ab-cta--ghost">Contact Us</Link>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="ab-stats">
          {STATS.map(s => (
            <div key={s.label} className="ab-stat">
              <span className="ab-stat__val">{s.value}</span>
              <span className="ab-stat__lbl">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── FEATURES ── */}
        <section className="ab-section">
          <div className="ab-section__eyebrow">What We Built</div>
          <h2 className="ab-section__h2">Everything your connection needs, measured right</h2>
          <div className="ab-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="ab-card">
                <div className="ab-card__icon">{f.icon}</div>
                <div className="ab-card__title">{f.title}</div>
                <div className="ab-card__desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── MISSION ── */}
        <section className="ab-mission">
          <div className="ab-section__eyebrow">Our Mission</div>
          <blockquote className="ab-mission__quote">
            "Internet access is a fundamental right. Knowing the quality of that access
            should be free, instant, and accurate — for everyone, everywhere."
          </blockquote>
          <p className="ab-mission__body">
            Cyber Vision Technologies builds tools that give people clarity over their digital
            infrastructure. NetSpeed is our commitment to transparency — a professional-grade
            network diagnostic tool available to anyone with a browser, from Karachi to California.
          </p>
        </section>

        {/* ── TECH ── */}
        <section className="ab-section">
          <div className="ab-section__eyebrow">Technology</div>
          <h2 className="ab-section__h2">How it works under the hood</h2>
          <div className="ab-tech-grid">
            {TECH.map(t => (
              <div key={t.name} className="ab-tech">
                <span className="ab-tech__name" style={{ color: t.color }}>{t.name}</span>
                <span className="ab-tech__role">{t.role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="ab-footer">
          <div className="ab-footer__logo">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="#00e5ff" strokeWidth="1.5" opacity=".4"/>
              <path d="M12 12 L19 5" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="2" fill="#00e5ff"/>
            </svg>
            <span>NetSpeed</span>
          </div>
          <p className="ab-footer__copy">
            © {new Date().getFullYear()}{' '}
            <a href="https://www.linkedin.com/company/cybervisiontechnologies/"
              target="_blank" rel="noopener noreferrer" className="ab-footer__link">
              Cyber Vision Technologies
            </a>
            . All rights reserved. Free to use. No data sold.
          </p>
          <nav className="ab-footer__nav" aria-label="Footer navigation">
            <Link href="/">Speed Test</Link>
            <Link href="/blog">Guides</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </footer>

      </main>
    </>
  );
}
