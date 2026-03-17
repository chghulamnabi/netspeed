import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

const SITE_URL = 'https://speedtest.chghulamnabi.com';
const ADSENSE_ID = 'ca-pub-8643140577697781';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Internet Speed Test — Check Your Download & Upload Speed Free',
    template: '%s | SpeedTest',
  },
  description:
    'Test your internet speed instantly. Measure download speed, upload speed, latency, and jitter with our free real-time broadband speed test tool.',
  keywords: [
    'internet speed test',
    'broadband speed test',
    'download speed test',
    'upload speed test',
    'wifi speed test',
    'ping test',
    'latency test',
    'free speed test',
    'check internet speed',
    'network speed test',
  ],
  authors: [{ name: 'SpeedTest' }],
  creator: 'SpeedTest',
  publisher: 'SpeedTest',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'SpeedTest',
    title: 'Internet Speed Test — Check Your Download & Upload Speed Free',
    description:
      'Test your internet speed instantly. Measure download, upload, latency and jitter for free.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SpeedTest' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Internet Speed Test — Free Broadband Speed Checker',
    description: 'Measure your download speed, upload speed, ping and jitter instantly.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: SITE_URL },
  verification: {
    google: 'REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_TOKEN',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense account verification */}
        <meta name="google-adsense-account" content="ca-pub-8643140577697781" />
        {/* Google AdSense */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
