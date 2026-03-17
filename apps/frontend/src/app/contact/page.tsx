'use client';

import { useForm, ValidationError } from '@formspree/react';
import Link from 'next/link';

const SUBJECTS = [
  'General Inquiry',
  'Bug Report',
  'Feature Request',
  'Business / Partnership',
  'Press / Media',
  'Other',
];

export default function ContactPage() {
  const [state, handleSubmit] = useForm('xkoqpzjo');

  return (
    <>
      <div className="bg-scene">
        <div className="stars" />
        <div className="grid-floor" />
      </div>

      <div className="page" style={{ justifyContent: 'flex-start', paddingTop: 96 }}>

        <header className="header" style={{ marginBottom: 0 }}>
          <Link href="/" className="blog-back">← Speed Test</Link>
          <div className="header-title" style={{ marginTop: 12 }}>Contact Us</div>
          <div className="header-sub">Cyber Vision Technologies · We reply within 24 hours</div>
        </header>

        <div className="contact-layout">

          {/* ── Info panel ── */}
          <aside className="contact-info">
            <div className="contact-info__block">
              <div className="contact-info__label">Product</div>
              <div className="contact-info__value">NetSpeed v2.0</div>
            </div>
            <div className="contact-info__block">
              <div className="contact-info__label">Company</div>
              <a
                href="https://www.linkedin.com/company/cybervisiontechnologies/"
                target="_blank" rel="noopener noreferrer"
                className="contact-info__value contact-info__value--link"
              >
                Cyber Vision Technologies
                <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"
                  aria-hidden="true" style={{ marginLeft: 5, opacity: .5 }}>
                  <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42L17.59 5H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z"/>
                </svg>
              </a>
            </div>
            <div className="contact-info__block">
              <div className="contact-info__label">Email</div>
              <a href="mailto:atiehally@gmail.com" className="contact-info__value contact-info__value--link">
                atiehally@gmail.com
              </a>
            </div>
            <div className="contact-info__block">
              <div className="contact-info__label">Response Time</div>
              <div className="contact-info__value">Within 24 hours</div>
            </div>
            <div className="contact-info__divider" />
            <div className="contact-info__note">
              <span className="contact-info__note-icon" aria-hidden="true">💡</span>
              For bug reports, include your browser, device type, and the speed result you saw.
            </div>
          </aside>

          {/* ── Form ── */}
          <div className="contact-form-wrap">
            {state.succeeded ? (
              <div className="contact-success">
                <div className="contact-success__icon" aria-hidden="true">✓</div>
                <div className="contact-success__title">Message Sent</div>
                <p className="contact-success__text">
                  Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form" noValidate aria-label="Contact form">

                {/* Name */}
                <div className="contact-field">
                  <label className="contact-label" htmlFor="cf-name">
                    Full Name <span aria-hidden="true" style={{ color: '#ff1744' }}>*</span>
                  </label>
                  <input
                    id="cf-name" name="name" type="text"
                    autoComplete="name" placeholder="Your name"
                    className="contact-input" required
                  />
                  <ValidationError prefix="Name" field="name" errors={state.errors} className="contact-error" />
                </div>

                {/* Email */}
                <div className="contact-field">
                  <label className="contact-label" htmlFor="cf-email">
                    Email Address <span aria-hidden="true" style={{ color: '#ff1744' }}>*</span>
                  </label>
                  <input
                    id="cf-email" name="email" type="email"
                    autoComplete="email" placeholder="you@example.com"
                    className="contact-input" required
                  />
                  <ValidationError prefix="Email" field="email" errors={state.errors} className="contact-error" />
                </div>

                {/* Subject */}
                <div className="contact-field">
                  <label className="contact-label" htmlFor="cf-subject">Subject</label>
                  <select id="cf-subject" name="subject" className="contact-input contact-select">
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Message */}
                <div className="contact-field">
                  <label className="contact-label" htmlFor="cf-message">
                    Message <span aria-hidden="true" style={{ color: '#ff1744' }}>*</span>
                  </label>
                  <textarea
                    id="cf-message" name="message" rows={5}
                    placeholder="Tell us how we can help…"
                    className="contact-input contact-textarea" required
                  />
                  <ValidationError prefix="Message" field="message" errors={state.errors} className="contact-error" />
                </div>

                <button
                  type="submit"
                  className={`contact-submit${state.submitting ? ' contact-submit--sending' : ''}`}
                  disabled={state.submitting}
                  aria-busy={state.submitting}
                >
                  {state.submitting ? (
                    <>
                      <span className="contact-submit__spinner" aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                        <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
                      </svg>
                      Send Message
                    </>
                  )}
                </button>

              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
