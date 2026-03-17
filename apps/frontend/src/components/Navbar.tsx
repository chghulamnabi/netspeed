'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase());
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const links = [
    { href: '/', label: 'Speed Test' },
    { href: '/blog', label: 'Guides' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <nav className={`nb${scrolled ? ' nb--scrolled' : ''}`}>
        {/* Left — logo */}
        <Link href="/" className="nb-logo" aria-label="SpeedTest home">
          <span className="nb-logo__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity=".3"/>
              <path d="M12 12 L19 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
              <path d="M6 18 Q12 6 18 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".5"/>
            </svg>
          </span>
          <span className="nb-logo__text">NETSPEED</span>
          <span className="nb-logo__tag">v2.0</span>
        </Link>

        {/* Center — links (desktop) */}
        <div className="nb-links" role="navigation" aria-label="Main navigation">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`nb-link${pathname === l.href ? ' nb-link--active' : ''}`}
            >
              <span className="nb-link__dot" aria-hidden="true" />
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right — status cluster */}
        <div className="nb-right">
          {/* Signal bars */}
          <div className="nb-signal" aria-label="Signal strength" title="Network signal">
            {[1,2,3,4].map(i => (
              <span key={i} className={`nb-signal__bar nb-signal__bar--${i}`} />
            ))}
          </div>

          {/* Live clock */}
          <div className="nb-clock" aria-live="polite" aria-label="Current time">
            <span className="nb-clock__time">{time}</span>
            <span className="nb-clock__date">{date}</span>
          </div>

          {/* Status dot */}
          <div className="nb-status" title="System online">
            <span className="nb-status__dot" aria-hidden="true" />
            <span className="nb-status__label">ONLINE</span>
          </div>

          {/* Hamburger (mobile) */}
          <button
            className={`nb-burger${open ? ' nb-burger--open' : ''}`}
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`nb-drawer${open ? ' nb-drawer--open' : ''}`} aria-hidden={!open}>
        <div className="nb-drawer__inner">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`nb-drawer__link${pathname === l.href ? ' nb-drawer__link--active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="nb-drawer__clock">{time}</div>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="nb-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
