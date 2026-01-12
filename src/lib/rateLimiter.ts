// Client-side rate limiter using sliding window algorithm with user-based tracking
interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitLog {
  timestamp: Date;
  userId: string;
  action: string;
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private logs: RateLimitLog[] = [];
  private maxLogs = 100;
  
  /**
   * Generate a unique key combining user ID and action
   */
  private getKey(userId: string, action: string): string {
    return `${userId}:${action}`;
  }
  
  /**
   * Check if an action is rate limited for a specific user
   * @param userId - User identifier
   * @param action - Action type (e.g., 'auth', 'db-write')
   * @param maxRequests - Maximum requests allowed in the window
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status and remaining requests
   */
  check(userId: string, action: string, maxRequests: number, windowMs: number): { 
    allowed: boolean; 
    remaining: number; 
    resetIn: number;
  } {
    const key = this.getKey(userId, action);
    const now = Date.now();
    const entry = this.limits.get(key) || { timestamps: [] };
    
    // Filter out timestamps outside the window
    entry.timestamps = entry.timestamps.filter(ts => now - ts < windowMs);
    
    const remaining = Math.max(0, maxRequests - entry.timestamps.length);
    const oldestTimestamp = entry.timestamps[0] || now;
    const resetIn = Math.max(0, windowMs - (now - oldestTimestamp));
    
    const allowed = entry.timestamps.length < maxRequests;
    
    // Log the rate limit check
    this.addLog({
      timestamp: new Date(),
      userId,
      action,
      allowed,
      remaining: allowed ? remaining - 1 : 0,
      resetIn,
    });
    
    if (!allowed) {
      console.warn(`[RateLimit] BLOCKED - User: ${userId}, Action: ${action}, Reset in: ${Math.ceil(resetIn / 1000)}s`);
      return { allowed: false, remaining: 0, resetIn };
    }
    
    // Add current timestamp
    entry.timestamps.push(now);
    this.limits.set(key, entry);
    
    if (remaining <= 3) {
      console.warn(`[RateLimit] WARNING - User: ${userId}, Action: ${action}, Remaining: ${remaining - 1}`);
    }
    
    return { allowed: true, remaining: remaining - 1, resetIn };
  }
  
  /**
   * Add a log entry
   */
  private addLog(log: RateLimitLog): void {
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }
  
  /**
   * Get recent rate limit logs
   */
  getLogs(limit: number = 50): RateLimitLog[] {
    return this.logs.slice(0, limit);
  }
  
  /**
   * Get logs for a specific user
   */
  getUserLogs(userId: string, limit: number = 20): RateLimitLog[] {
    return this.logs.filter(log => log.userId === userId).slice(0, limit);
  }
  
  /**
   * Get blocked requests count
   */
  getBlockedCount(userId?: string): number {
    const filtered = userId 
      ? this.logs.filter(log => log.userId === userId && !log.allowed)
      : this.logs.filter(log => !log.allowed);
    return filtered.length;
  }
  
  /**
   * Reset rate limit for a specific user and action
   */
  reset(userId: string, action: string): void {
    const key = this.getKey(userId, action);
    this.limits.delete(key);
  }
  
  /**
   * Reset all rate limits for a user
   */
  resetUser(userId: string): void {
    const keysToDelete: string[] = [];
    this.limits.forEach((_, key) => {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.limits.delete(key));
  }
  
  /**
   * Clear all rate limits and logs
   */
  clear(): void {
    this.limits.clear();
    this.logs = [];
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
  userId: string,
  action: string, 
  config: { maxRequests: number; windowMs: number }
): void {
  const result = rateLimiter.check(userId, action, config.maxRequests, config.windowMs);
  
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
