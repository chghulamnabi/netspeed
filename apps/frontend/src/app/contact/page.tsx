'use client';

import { useForm, ValidationError } from '@formspree/react';
import Link from 'next/link';

const SUBJECTS = ['General Inquiry', 'Bug Report', 'Feature Request', 'Business / Partnership', 'Press / Media', 'Other'];

export default function ContactPage() {
  const [state, handleSubmit] = useForm('xkoqpzjo');

  return (
    <>
      <div className="bg-scene"><div className="stars" /><div className="grid-floor" /></div>

      <main className="ct-page">

        {/* ── HEADER ── */}
        <div className="ct-header">
          <Link href="/" className="ct-back">← Back</Link>
          <div className="ct-header__badge">
            <span className="ct-header__badge-dot" />
            Cyber Vision Technologies
          </div>
          <h1 className="ct-header__h1">Get in Touch</h1>
          <p className="ct-header__sub">We read every message and reply within 24 hours.</p>
        </div>

        <div className="ct-body">

          {/* ── LEFT PANEL ── */}
          <aside className="ct-aside">
            <div className="ct-aside__item">
              <div className="ct-aside__icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <div className="ct-aside__lbl">Email</div>
                <a href="mailto:atiehally@gmail.com" className="ct-aside__val ct-aside__val--link">atiehally@gmail.com</a>
              </div>
            </div>

            <div className="ct-aside__item">
              <div className="ct-aside__icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div>
                <div className="ct-aside__lbl">Company</div>
                <a href="https://www.linkedin.com/company/cybervisiontechnologies/"
                  target="_blank" rel="noopener noreferrer"
                  className="ct-aside__val ct-aside__val--link">
                  Cyber Vision Technologies ↗
                </a>
              </div>
            </div>

            <div className="ct-aside__item">
              <div className="ct-aside__icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div>
                <div className="ct-aside__lbl">Response Time</div>
                <div className="ct-aside__val">Within 24 hours</div>
              </div>
            </div>

            <div className="ct-aside__tip">
              <span aria-hidden="true">💡</span>
              For bug reports, include your browser, device, and the speed result you saw.
            </div>
          </aside>

          {/* ── FORM ── */}
          <div className="ct-form-card">
            {state.succeeded ? (
              <div className="ct-success">
                <div className="ct-success__ring">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#00e676" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="ct-success__title">Message Sent!</div>
                <p className="ct-success__body">
                  Thanks for reaching out. We&apos;ll reply to your email within 24 hours.
                </p>
                <Link href="/" className="ct-submit" style={{ textDecoration: 'none', display: 'inline-flex', marginTop: 8 }}>
                  Back to Speed Test
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="ct-form" noValidate aria-label="Contact form">

                <div className="ct-row">
                  {/* Name */}
                  <div className="ct-field">
                    <label className="ct-label" htmlFor="cf-name">Full Name <span className="ct-req">*</span></label>
                    <input id="cf-name" name="name" type="text" autoComplete="name"
                      placeholder="Your full name" className="ct-input" required />
                    <ValidationError prefix="Name" field="name" errors={state.errors} className="ct-err" />
                  </div>
                  {/* Email */}
                  <div className="ct-field">
                    <label className="ct-label" htmlFor="cf-email">Email Address <span className="ct-req">*</span></label>
                    <input id="cf-email" name="email" type="email" autoComplete="email"
                      placeholder="you@example.com" className="ct-input" required />
                    <ValidationError prefix="Email" field="email" errors={state.errors} className="ct-err" />
                  </div>
                </div>

                {/* Subject */}
                <div className="ct-field">
                  <label className="ct-label" htmlFor="cf-subject">Subject</label>
                  <select id="cf-subject" name="subject" className="ct-input ct-select">
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Message */}
                <div className="ct-field">
                  <label className="ct-label" htmlFor="cf-message">Message <span className="ct-req">*</span></label>
                  <textarea id="cf-message" name="message" rows={5}
                    placeholder="Tell us how we can help…"
                    className="ct-input ct-textarea" required />
                  <ValidationError prefix="Message" field="message" errors={state.errors} className="ct-err" />
                </div>

                <button type="submit" className="ct-submit" disabled={state.submitting} aria-busy={state.submitting}>
                  {state.submitting ? (
                    <><span className="ct-spinner" aria-hidden="true" /> Sending…</>
                  ) : (
                    <><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg> Send Message</>
                  )}
                </button>

              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
