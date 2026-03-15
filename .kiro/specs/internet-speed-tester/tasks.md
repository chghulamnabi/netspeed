# Implementation Plan: Internet Speed Tester

## Overview

Simple speed test app using Next.js. No auth, no database, no external services.

## Tasks

- [x] 1. Set up project structure
  - Next.js app inside `apps/frontend` (already exists)
  - Shared types in `packages/types`
  - _Requirements: 4.1-4.4_

- [ ] 2. Define shared types
  - [x] 2.1 Add `TestResult` and `TestProgress` interfaces to `packages/types/src/index.ts`
    - _Requirements: 3.1-3.4_

- [ ] 3. Implement backend API routes
  - [x] 3.1 Create `GET /api/ping` - minimal response for latency measurement
    - _Requirements: 1.3_
  - [x] 3.2 Create `GET /api/download` - streams random bytes to client
    - _Requirements: 1.1_
  - [x] 3.3 Create `POST /api/upload` - accepts and discards data
    - _Requirements: 1.2_

- [ ] 4. Implement browser-based test engine
  - [x] 4.1 Latency measurement (10 pings, average + jitter)
    - _Requirements: 1.3, 3.3, 3.4_
  - [x] 4.2 Download speed measurement (streaming fetch, sampled throughput)
    - _Requirements: 1.1, 2.1, 3.1_
  - [x] 4.3 Upload speed measurement (chunked POST, sampled throughput)
    - _Requirements: 1.2, 2.2, 3.2_

- [ ] 5. Build React UI
  - [x] 5.1 Main page with Start button and progress display
    - _Requirements: 2.1-2.3_
  - [x] 5.2 Results panel showing download, upload, latency, jitter
    - _Requirements: 3.1-3.4_
  - [x] 5.3 Responsive layout for mobile and desktop
    - _Requirements: 4.2-4.3_
