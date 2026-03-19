'use client';

import { useEffect, useRef } from 'react';

interface Props {
  slot: string;
  format?: string;
  className?: string;
  style?: React.CSSProperties;
}

const PUB_ID = 'ca-pub-8643140577697781';

export default function AdUnit({ slot, format = 'auto', className = '', style }: Props) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded yet — safe to ignore
    }
  }, []);

  return (
    <div className={`ad-slot ad-slot--horizontal ${className}`} aria-label="Advertisement" style={style}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={PUB_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
