// Core domain types for the Internet Speed Tester application

export interface TestSession {
  id: string;
  userId?: string; // Optional for anonymous users
  serverId: string;
  serverLocation: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  clientInfo: {
    userAgent: string;
    ipAddress: string; // Anonymized to /24 subnet
    connectionType?: 'wifi' | 'ethernet' | 'mobile';
  };
  measurements: {
    downloadSpeed?: number; // Mbps
    uploadSpeed?: number; // Mbps
    latency?: number; // ms
    jitter?: number; // ms
    packetLoss?: number; // percentage
  };
  metadata: {
    testDuration: number; // seconds
    dataTransferred: number; // bytes
    errorMessages?: string[];
  };
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  profile: {
    displayName?: string;
    timezone: string;
    preferredUnits: 'metric' | 'imperial';
  };
  preferences: {
    dataCollection: boolean;
    emailNotifications: boolean;
    publicProfile: boolean;
  };
  subscription?: {
    plan: 'free' | 'premium';
    apiQuota: number;
    apiUsage: number;
  };
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface TestServer {
  id: string;
  location: {
    country: string;
    countryCode: string;
    city: string;
    coordinates: [number, number];
  };
  endpoints: {
    http: string;
    https: string;
    websocket: string;
  };
  status: 'active' | 'maintenance' | 'offline';
  capacity: {
    maxConcurrentTests: number;
    currentLoad: number;
  };
  performance: {
    averageLatency: number;
    uptime: number; // percentage
    lastHealthCheck: Date;
  };
}

export interface PerformanceMetrics {
  region: string; // Country or global
  timeframe: 'hour' | 'day' | 'week' | 'month';
  timestamp: Date;
  statistics: {
    averageDownload: number;
    averageUpload: number;
    averageLatency: number;
    medianDownload: number;
    medianUpload: number;
    testCount: number;
    uniqueUsers: number;
  };
  percentiles: {
    download: { p50: number; p90: number; p95: number; p99: number };
    upload: { p50: number; p90: number; p95: number; p99: number };
    latency: { p50: number; p90: number; p95: number; p99: number };
  };
}

// API Request/Response types
export interface StartTestRequest {
  serverId?: string; // Optional - will auto-select if not provided
  clientInfo: {
    userAgent: string;
    connectionType?: 'wifi' | 'ethernet' | 'mobile';
  };
}

export interface StartTestResponse {
  testId: string;
  serverId: string;
  serverLocation: TestServer['location'];
  websocketUrl: string;
}

export interface TestProgressUpdate {
  testId: string;
  status: TestSession['status'];
  progress: number; // 0-100
  currentMeasurement?: {
    type: 'download' | 'upload' | 'latency';
    value: number;
  };
  estimatedTimeRemaining?: number; // seconds
}

export interface TestResults {
  testId: string;
  measurements: TestSession['measurements'];
  serverLocation: TestServer['location'];
  testDuration: number;
  timestamp: Date;
  comparisons?: {
    countryAverage?: number;
    globalAverage?: number;
    ispAverage?: number;
    percentile?: number;
  };
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
  timezone: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'passwordHash'>;
  expiresAt: Date;
}

// API Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Geolocation types
export interface LocationInfo {
  country: string;
  countryCode: string;
  city: string;
  coordinates: [number, number];
  timezone: string;
  isp?: string;
}

export interface ServerDistance {
  serverId: string;
  distance: number; // kilometers
  estimatedLatency: number; // milliseconds
}

// WebSocket message types
export type WebSocketMessage = 
  | { type: 'test_progress'; data: TestProgressUpdate }
  | { type: 'test_complete'; data: TestResults }
  | { type: 'test_error'; data: ApiError }
  | { type: 'ping'; data: { timestamp: number } }
  | { type: 'pong'; data: { timestamp: number } };

// Configuration types
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  websocket: {
    url: string;
    reconnectAttempts: number;
    reconnectDelay: number;
  };
  test: {
    maxDuration: number; // seconds
    downloadSizes: number[]; // bytes
    uploadSizes: number[]; // bytes
    latencyPings: number;
  };
}

export interface TestResult {
  downloadSpeed: number; // Mbps
  uploadSpeed: number;   // Mbps
  latency: number;       // ms (average)
  jitter: number;        // ms
  timestamp: Date;
}

export interface TestProgress {
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  progress: number;       // 0-100
  currentSpeed?: number;  // Mbps (during download/upload phases)
}

// Export all validation schemas and functions
// export * from './schemas';