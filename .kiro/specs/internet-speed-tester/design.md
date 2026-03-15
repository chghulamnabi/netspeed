# Design Document: Internet Speed Tester

## Overview

A simple, no-login web app that measures download speed, upload speed, and latency. Built with a Next.js frontend and a lightweight Node.js backend that serves as the test endpoint.

## Architecture

```
Browser (Next.js)
  └── Test Engine (fetch-based measurements)
        └── Backend API (Next.js API routes)
              ├── GET  /api/ping          - latency measurement
              ├── GET  /api/download      - download test (streams random bytes)
              └── POST /api/upload        - upload test (receives data, discards)
```

No database. No auth. No external services.

## Components

### Frontend

#### Test Engine
- Download: fetch a stream of random bytes, measure throughput over time
- Upload: POST generated binary data, measure throughput over time
- Latency: repeated fetch to `/api/ping`, average round-trip time
- Jitter: standard deviation of latency samples

#### UI
- Single page with a "Start Test" button
- Real-time speed gauge updating during test
- Results panel shown after completion
- Responsive layout (mobile + desktop)

### Backend (Next.js API Routes)

#### `GET /api/ping`
Returns a minimal response for latency measurement.

#### `GET /api/download`
Streams a configurable amount of random bytes to the client.

#### `POST /api/upload`
Accepts and discards uploaded data, returns timing info.

## Data Models

```typescript
interface TestResult {
  downloadSpeed: number;  // Mbps
  uploadSpeed: number;    // Mbps
  latency: number;        // ms (average)
  jitter: number;         // ms
  timestamp: Date;
}

interface TestProgress {
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  progress: number;       // 0-100
  currentSpeed?: number;  // Mbps (during download/upload phases)
}
```

## Measurement Approach

### Download Speed
- Fetch a large payload (e.g. 25MB) from `/api/download`
- Sample bytes received every 200ms
- Report speed as moving average of recent samples

### Upload Speed
- POST generated random data in chunks to `/api/upload`
- Sample bytes sent every 200ms
- Report speed as moving average

### Latency & Jitter
- Send 10 sequential pings to `/api/ping`
- Average = latency, std deviation = jitter
