'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

// Formspree endpoint — sign up at formspree.io, create a form, replace this ID
// Steps: formspree.io → New Form → add atiehally@gmail.com → copy the form ID
const FORMSPREE_ID = 'xpwzgkqb'; // replace with your real Formspree form ID

type Status = 'idle' | 'sending' | 'success' | 'error';

const SUBJECTS = [
  'General Inquiry',
  'Bug Report',
  'Feature Request',
  'Business / Partnership',
  'Press / Media',
  'Other',
];

export default function ContactPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  function validate(data: FormData): Record<string, string> {
    const e: Record<string, string> = {};
    const name = (data.get('name') as string)?.trim();
    const email = (data.get('email') as string)?.trim();
    const message = (data.get('message') as string)?.trim();
    if (!name || name.length < 2) e.name = 'Name must be at least 2 characters.';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.';
    if (!message || message.length < 10) e.message = 'Message must be at least 10 characters.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const errs = validate(data);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus('sending');
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setStatus('success');
        formRef.current?.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <div className="bg-scene">
        <div className="stars" />
        <div className="grid-floor" />
      </div>

      <div className="page" style={{ justifyContent: 'flex-start', paddingTop: 96 }}>

        {/* Header */}
        <header className="header" style={{ marginBottom: 0 }}>
          <Link href="/" className="blog-back">← Speed Test</Link>
          <div className="header-title" style={{ marginTop: 12 }}>Contact Us</div>
          <div className="header-sub">Cyber Vision Technologies · We reply within 24 hours</div>
        </header>

        <div className="contact-layout">

          {/* ── Left — info panel ── */}
          <aside className="contact-info">
            <div className="contact-info__block">
              <div className="contact-info__label">Product</div>
              <div className="contact-info__value">NetSpeed v2.0</div>
            </div>
            <div className="contact-info__block">
              <div className="contact-info__label">Company</div>
              <a
                href="https://www.linkedin.com/company/cybervisiontechnologies/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-info__value contact-info__value--link"
              >
                Cyber Vision Technologies
                <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true" style={{ marginLeft: 5, opacity: .5 }}>
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
              For bug reports, please include your browser, device type, and the speed test result you saw.
            </div>
          </aside>

          {/* ── Right — form ── */}
          <div className="contact-form-wrap">
            {status === 'success' ? (
              <div className="contact-success">
                <div className="contact-success__icon" aria-hidden="true">✓</div>
                <div className="contact-success__title">Message Sent</div>
                <p className="contact-success__text">
                  Thanks for reaching out. We'll get back to you at your email within 24 hours.
                </p>
                <button
                  className="contact-submit"
                  onClick={() => setStatus('idle')}
                  style={{ marginTop: 8 }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="contact-form"
                noValidate
                aria-label="Contact form"
              >
                {/* Hidden fields for Formspree */}
                <input type="hidden" name="_subject" value="NetSpeed Contact Form Submission" />
                <input type="hidden" name="_replyto" value="atiehally@gmail.com" />

                {/* Name */}
                <div className="contact-field">
                  <label className="contact-label" htmlFor="cf-name">
                    Full Name <span aria-hidden="true" style={{ color: '#ff1744' }}>*</span>
                  </label>
                  <input
                    id="cf-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    className={`contact-input${errors.name ? ' contact-input--error' : ''}`}
                    aria-describedby={errors.name ? 'cf-name-err' : undefined}
                    aria-invalid={!!errors.name}
                    onChange={() => errors.name && setErrors(p => ({ ...p, name: '' }))}
                  />
                  {errors.name && <span id="cf-name-err" className="contact-error" role="alert">{errors.name}</span>}
                </div>

                {/* Email */}
                <div className="contact-field">
                  <label className="contact-label" htmlFor="cf-email">
                    Email Address <span aria-hidden="true" style={{ color: '#ff1744' }}>*</span>
                  </label>
                  <input
                    id="cf-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`contact-input${errors.email ? ' contact-input--error' : ''}`}
                    aria-describedby={errors.email ? 'cf-email-err' : undefined}
                    aria-invalid={!!errors.email}
                    onChange={() => errors.email && setErrors(p => ({ ...p, email: '' }))}
                  />
                  {errors.email && <span id="cf-email-err" className="contact-error" role="alert">{errors.email}</span>}
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
                    id="cf-message"
                    name="message"
                    rows={5}
                    placeholder="Tell us how we can help…"
                    className={`contact-input contact-textarea${errors.message ? ' contact-input--error' : ''}`}
                    aria-describedby={errors.message ? 'cf-msg-err' : undefined}
                    aria-invalid={!!errors.message}
                    onChange={() => errors.message && setErrors(p => ({ ...p, message: '' }))}
                  />
                  {errors.message && <span id="cf-msg-err" className="contact-error" role="alert">{errors.message}</span>}
                </div>

                {/* Error banner */}
                {status === 'error' && (
                  <div className="contact-banner contact-banner--error" role="alert">
                    Something went wrong. Please try again or email us directly at atiehally@gmail.com
                  </div>
                )}

                <button
                  type="submit"
                  className={`contact-submit${status === 'sending' ? ' contact-submit--sending' : ''}`}
                  disabled={status === 'sending'}
                  aria-busy={status === 'sending'}
                >
                  {status === 'sending' ? (
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
