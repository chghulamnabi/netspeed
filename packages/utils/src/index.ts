// Shared utility functions for the Internet Speed Tester application

// Basic types for utilities (avoiding circular dependencies)
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Location {
  country: string;
  city: string;
  coordinates: [number, number];
}

interface Server {
  id: string;
  location: Location;
  status: 'active' | 'maintenance' | 'offline';
}

/**
 * Calculate the distance between two geographic coordinates using the Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find the nearest server to a given location
 */
export function findNearestServer(
  userLocation: Location,
  servers: Server[]
): Server | null {
  if (servers.length === 0) return null;
  
  const activeServers = servers.filter(server => server.status === 'active');
  if (activeServers.length === 0) return null;
  
  let nearestServer = activeServers[0];
  let minDistance = calculateDistance(
    userLocation.coordinates[0],
    userLocation.coordinates[1],
    nearestServer.location.coordinates[0],
    nearestServer.location.coordinates[1]
  );
  
  for (let i = 1; i < activeServers.length; i++) {
    const server = activeServers[i];
    const distance = calculateDistance(
      userLocation.coordinates[0],
      userLocation.coordinates[1],
      server.location.coordinates[0],
      server.location.coordinates[1]
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestServer = server;
    }
  }
  
  return nearestServer;
}

/**
 * Format speed value for display
 */
export function formatSpeed(speedMbps: number): string {
  if (speedMbps >= 1000) {
    return `${(speedMbps / 1000).toFixed(2)} Gbps`;
  }
  return `${speedMbps.toFixed(2)} Mbps`;
}

/**
 * Format latency value for display
 */
export function formatLatency(latencyMs: number): string {
  return `${Math.round(latencyMs)} ms`;
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a random test data chunk for upload testing
 */
export function generateTestData(sizeBytes: number): ArrayBuffer {
  const buffer = new ArrayBuffer(sizeBytes);
  const view = new Uint8Array(buffer);
  
  // Fill with random data
  for (let i = 0; i < sizeBytes; i++) {
    view[i] = Math.floor(Math.random() * 256);
  }
  
  return buffer;
}

/**
 * Calculate throughput from bytes transferred and time elapsed
 */
export function calculateThroughput(bytes: number, timeMs: number): number {
  const bitsPerSecond = (bytes * 8) / (timeMs / 1000);
  return bitsPerSecond / 1_000_000; // Convert to Mbps
}

/**
 * Anonymize IP address to /24 subnet for privacy
 */
export function anonymizeIpAddress(ipAddress: string): string {
  const parts = ipAddress.split('.');
  if (parts.length === 4) {
    // IPv4
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }
  
  // For IPv6, return first 64 bits
  const ipv6Parts = ipAddress.split(':');
  if (ipv6Parts.length >= 4) {
    return `${ipv6Parts.slice(0, 4).join(':')}::`;
  }
  
  return ipAddress; // Return as-is if format is unexpected
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Debounce function to limit rapid successive calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit call frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}