// Client-side rate limiter using sliding window algorithm
interface RateLimitEntry {
  timestamps: number[];
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  
  /**
   * Check if an action is rate limited
   * @param key - Unique identifier for the rate limit (e.g., 'auth', 'db-write')
   * @param maxRequests - Maximum requests allowed in the window
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status and remaining requests
   */
  check(key: string, maxRequests: number, windowMs: number): { 
    allowed: boolean; 
    remaining: number; 
    resetIn: number;
  } {
    const now = Date.now();
    const entry = this.limits.get(key) || { timestamps: [] };
    
    // Filter out timestamps outside the window
    entry.timestamps = entry.timestamps.filter(ts => now - ts < windowMs);
    
    const remaining = Math.max(0, maxRequests - entry.timestamps.length);
    const oldestTimestamp = entry.timestamps[0] || now;
    const resetIn = Math.max(0, windowMs - (now - oldestTimestamp));
    
    if (entry.timestamps.length >= maxRequests) {
      return { allowed: false, remaining: 0, resetIn };
    }
    
    // Add current timestamp
    entry.timestamps.push(now);
    this.limits.set(key, entry);
    
    return { allowed: true, remaining: remaining - 1, resetIn };
  }
  
  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.limits.delete(key);
  }
  
  /**
   * Clear all rate limits
   */
  clear(): void {
    this.limits.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Rate limit configurations
export const RATE_LIMITS = {
  AUTH: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests per minute
  DB_WRITE: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 writes per minute
  DB_READ: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 reads per minute
} as const;

// Helper function to check rate limit and throw if exceeded
export function checkRateLimit(
  key: string, 
  config: { maxRequests: number; windowMs: number }
): void {
  const result = rateLimiter.check(key, config.maxRequests, config.windowMs);
  
  if (!result.allowed) {
    const resetInSeconds = Math.ceil(result.resetIn / 1000);
    throw new RateLimitError(
      `Too many requests. Please try again in ${resetInSeconds} seconds.`,
      result.resetIn
    );
  }
}

export class RateLimitError extends Error {
  public resetIn: number;
  
  constructor(message: string, resetIn: number) {
    super(message);
    this.name = 'RateLimitError';
    this.resetIn = resetIn;
  }
}
