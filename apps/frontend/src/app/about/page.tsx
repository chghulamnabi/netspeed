import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

const SITE_URL = 'https://speedtest.chghulamnabi.com';

export const metadata: Metadata = {
  title: 'About — Cyber Vision Technologies',
  description:
    'NetSpeed is a free internet speed test tool built by Cyber Vision Technologies. Measure download, upload, ping and jitter instantly — no app required.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/about`,
    title: 'About NetSpeed — Cyber Vision Technologies',
    description: 'Free internet speed test built by Cyber Vision Technologies.',
  },
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Cyber Vision Technologies',
  url: 'https://www.linkedin.com/company/cybervisiontechnologies/',
  sameAs: ['https://www.linkedin.com/company/cybervisiontechnologies/'],
  product: {
    '@type': 'SoftwareApplication',
    name: 'NetSpeed',
    url: SITE_URL,
    applicationCategory: 'UtilitiesApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  },
};

const FEATURES = [
  { icon: '⚡', title: 'Real-Time Measurement', desc: 'Live download and upload speed tracked every 250ms using parallel streams — no sampling, no averages.' },
  { icon: '🌐', title: 'Global Edge Network', desc: 'Powered by Cloudflare\'s global network — tests route to the nearest point of presence for accurate local results.' },
  { icon: '📡', title: 'Full Diagnostics', desc: 'Beyond speed — measures latency, jitter, packet loss, and server response time with actionable fix recommendations.' },
  { icon: '🗺️', title: 'Nearby ISP Finder', desc: 'Locate internet service providers and network infrastructure near you using open map data.' },
  { icon: '🔒', title: 'Privacy First', desc: 'No account required. No personal data stored. No tracking beyond standard analytics.' },
  { icon: '📱', title: 'Works Everywhere', desc: 'Fully responsive — desktop, tablet, mobile. Tests 5G, 4G, fiber, cable, DSL, and satellite connections.' },
];

const STATS = [
  { value: '190+', label: 'Countries Served' },
  { value: '15s', label: 'Test Duration' },
  { value: '8×', label: 'Parallel Streams' },
  { value: '100%', label: 'Free Forever' },
];

export default function AboutPage() {
  return (
    <>
      <Script
        id="org-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <div className="bg-scene">
        <div className="stars" />
        <div className="grid-floor" />
      </div>

      <div className="page" style={{ justifyContent: 'flex-start', paddingTop: 96 }}>

        {/* ── Hero ── */}
        <section className="about-hero">
          <div className="about-hero__eyebrow">Built by</div>
          <h1 className="about-hero__company">Cyber Vision Technologies</h1>
          <div className="about-hero__product">
            <span className="about-hero__product-name">NetSpeed</span>
            <span className="about-hero__product-tag">v2.0</span>
          </div>
          <p className="about-hero__desc">
            A free, open-access internet speed test tool — engineered for accuracy, built for everyone.
            No ads blocking your results. No sign-up. Just your real connection speed.
          </p>
          <div className="about-hero__actions">
            <Link href="/" className="about-btn about-btn--primary">Run Speed Test</Link>
            <a
              href="https://www.linkedin.com/company/cybervisiontechnologies/"
              target="_blank"
              rel="noopener noreferrer"
              className="about-btn about-btn--secondary"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          </div>
        </section>

        {/* ── Stats ── */}
        <div className="about-stats">
          {STATS.map(s => (
            <div key={s.label} className="about-stat">
              <span className="about-stat__value">{s.value}</span>
              <span className="about-stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Features ── */}
        <section className="about-section">
          <div className="about-section__label">What We Built</div>
          <h2 className="about-section__title">Everything your connection needs to be measured right</h2>
          <div className="about-features">
            {FEATURES.map(f => (
              <div key={f.title} className="about-feature">
                <span className="about-feature__icon" aria-hidden="true">{f.icon}</span>
                <div>
                  <div className="about-feature__title">{f.title}</div>
                  <div className="about-feature__desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mission ── */}
        <section className="about-mission">
          <div className="about-mission__inner">
            <div className="about-section__label">Our Mission</div>
            <blockquote className="about-mission__quote">
              "Internet access is a fundamental right. Knowing the quality of that access should be free, instant, and accurate — for everyone, everywhere."
            </blockquote>
            <p className="about-mission__text">
              Cyber Vision Technologies builds tools that give people clarity over their digital infrastructure.
              NetSpeed is our commitment to transparency — a professional-grade network diagnostic tool
              available to anyone with a browser, from Karachi to California.
            </p>
          </div>
        </section>

        {/* ── Tech stack ── */}
        <section className="about-section">
          <div className="about-section__label">Technology</div>
          <h2 className="about-section__title">How it works under the hood</h2>
          <div className="about-tech">
            {[
              { name: 'Next.js 14', role: 'Frontend framework', color: '#fff' },
              { name: 'Cloudflare Workers', role: 'Global edge compute', color: '#f6821f' },
              { name: 'TypeScript', role: 'Type-safe codebase', color: '#3178c6' },
              { name: 'Vercel', role: 'Deployment & CDN', color: '#fff' },
              { name: 'Turborepo', role: 'Monorepo build system', color: '#ef4444' },
              { name: 'Leaflet + OSM', role: 'Open-source mapping', color: '#00e676' },
            ].map(t => (
              <div key={t.name} className="about-tech__item">
                <span className="about-tech__name" style={{ color: t.color }}>{t.name}</span>
                <span className="about-tech__role">{t.role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer / copyright ── */}
        <footer className="about-footer">
          <div className="about-footer__logo">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="#00e5ff" strokeWidth="1.5" opacity=".4"/>
              <path d="M12 12 L19 5" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="2" fill="#00e5ff"/>
              <path d="M6 18 Q12 6 18 6" stroke="#00e5ff" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".5"/>
            </svg>
            <span className="about-footer__brand">NetSpeed</span>
          </div>
          <p className="about-footer__copy">
            © {new Date().getFullYear()} Cyber Vision Technologies. All rights reserved.
          </p>
          <p className="about-footer__copy" style={{ marginTop: 4 }}>
            NetSpeed is a product of{' '}
            <a
              href="https://www.linkedin.com/company/cybervisiontechnologies/"
              target="_blank"
              rel="noopener noreferrer"
              className="about-footer__link"
            >
              Cyber Vision Technologies
            </a>
            . Free to use. No data sold. No accounts required.
          </p>
          <div className="about-footer__links">
            <Link href="/" className="about-footer__nav">Speed Test</Link>
            <Link href="/blog" className="about-footer__nav">Guides</Link>
            <Link href="/about" className="about-footer__nav">About</Link>
          </div>
        </footer>

      </div>
    </>
  );
}
