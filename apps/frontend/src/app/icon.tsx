import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#0a0a1a',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Speedometer arc */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {/* Outer arc */}
          <path
            d="M4 14 A8 8 0 1 1 20 14"
            stroke="#00f5ff"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Speed needle */}
          <line
            x1="12"
            y1="14"
            x2="17"
            y2="7"
            stroke="#ff00ff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Center dot */}
          <circle cx="12" cy="14" r="1.5" fill="#00f5ff" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
