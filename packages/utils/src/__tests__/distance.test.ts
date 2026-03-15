import { calculateDistance, formatSpeed, formatLatency } from '../index';

describe('Distance Calculations', () => {
  test('calculateDistance should return correct distance between two points', () => {
    // Distance between New York and Los Angeles (approximately 3944 km)
    const nyLat = 40.7128;
    const nyLon = -74.0060;
    const laLat = 34.0522;
    const laLon = -118.2437;
    
    const distance = calculateDistance(nyLat, nyLon, laLat, laLon);
    
    // Allow for some variance in calculation
    expect(distance).toBeGreaterThan(3900);
    expect(distance).toBeLessThan(4000);
  });

  test('calculateDistance should return 0 for same coordinates', () => {
    const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
    expect(distance).toBe(0);
  });
});

describe('Formatting Functions', () => {
  test('formatSpeed should format speeds correctly', () => {
    expect(formatSpeed(100.5)).toBe('100.50 Mbps');
    expect(formatSpeed(1500)).toBe('1.50 Gbps');
    expect(formatSpeed(0.5)).toBe('0.50 Mbps');
  });

  test('formatLatency should format latency correctly', () => {
    expect(formatLatency(25.7)).toBe('26 ms');
    expect(formatLatency(100.2)).toBe('100 ms');
    expect(formatLatency(5.1)).toBe('5 ms');
  });
});