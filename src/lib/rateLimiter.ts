// Client-side rate limiter with exponential backoff and user-based tracking
interface RateLimitEntry {
  timestamps: number[];
  backoffUntil?: number;
  consecutiveBlocks: number;
}

interface RateLimitLog {
  timestamp: Date;
  userId: string;
  action: string;
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private logs: RateLimitLog[] = [];
  private maxLogs = 100;
  
  private getKey(userId: string, action: string): string {
    return `${userId}:${action}`;
  }
  
  /**
   * Check if an action is rate limited with exponential backoff support
   */
  check(userId: string, action: string, maxRequests: number, windowMs: number): { 
    allowed: boolean; 
    remaining: number; 
    resetIn: number;
    inBackoff: boolean;
  } {
    const key = this.getKey(userId, action);
    const now = Date.now();
    const entry = this.limits.get(key) || { timestamps: [], consecutiveBlocks: 0 };
    
    // Check if in backoff period
    if (entry.backoffUntil && now < entry.backoffUntil) {
      const resetIn = entry.backoffUntil - now;
      this.addLog({ timestamp: new Date(), userId, action, allowed: false, remaining: 0, resetIn });
      return { allowed: false, remaining: 0, resetIn, inBackoff: true };
    }
    
    // Clear backoff if expired
    if (entry.backoffUntil && now >= entry.backoffUntil) {
      entry.backoffUntil = undefined;
      entry.consecutiveBlocks = Math.max(0, entry.consecutiveBlocks - 1);
    }
    
    // Filter timestamps outside window
    entry.timestamps = entry.timestamps.filter(ts => now - ts < windowMs);
    
    const remaining = Math.max(0, maxRequests - entry.timestamps.length);
    const oldestTimestamp = entry.timestamps[0] || now;
    const resetIn = Math.max(0, windowMs - (now - oldestTimestamp));
    
    const allowed = entry.timestamps.length < maxRequests;
    
    this.addLog({ timestamp: new Date(), userId, action, allowed, remaining: allowed ? remaining - 1 : 0, resetIn });
    
    if (!allowed) {
      // Apply exponential backoff
      entry.consecutiveBlocks++;
      const backoffMs = Math.min(
        1000 * Math.pow(2, entry.consecutiveBlocks - 1), // 1s, 2s, 4s, 8s...
        30000 // Max 30 seconds
      );
      entry.backoffUntil = now + backoffMs;
      this.limits.set(key, entry);
      
      console.warn(`[RateLimit] BLOCKED - User: ${userId}, Action: ${action}, Backoff: ${Math.ceil(backoffMs / 1000)}s`);
      return { allowed: false, remaining: 0, resetIn: backoffMs, inBackoff: false };
    }
    
    // Success - reduce consecutive blocks
    if (entry.consecutiveBlocks > 0) {
      entry.consecutiveBlocks = Math.max(0, entry.consecutiveBlocks - 0.5);
    }
    
    entry.timestamps.push(now);
    this.limits.set(key, entry);
    
    if (remaining <= 5) {
      console.warn(`[RateLimit] WARNING - User: ${userId}, Action: ${action}, Remaining: ${remaining - 1}`);
    }
    
    return { allowed: true, remaining: remaining - 1, resetIn, inBackoff: false };
  }
  
  private addLog(log: RateLimitLog): void {
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }
  
  getLogs(limit: number = 50): RateLimitLog[] {
    return this.logs.slice(0, limit);
  }
  
  getUserLogs(userId: string, limit: number = 20): RateLimitLog[] {
    return this.logs.filter(log => log.userId === userId).slice(0, limit);
  }
  
  getBlockedCount(userId?: string): number {
    const filtered = userId 
      ? this.logs.filter(log => log.userId === userId && !log.allowed)
      : this.logs.filter(log => !log.allowed);
    return filtered.length;
  }
  
  reset(userId: string, action: string): void {
    const key = this.getKey(userId, action);
    this.limits.delete(key);
  }
  
  resetUser(userId: string): void {
    const keysToDelete: string[] = [];
    this.limits.forEach((_, key) => {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.limits.delete(key));
  }
  
  clear(): void {
    this.limits.clear();
    this.logs = [];
  }
}

export const rateLimiter = new RateLimiter();

// Adjusted rate limits - more permissive for better UX
export const RATE_LIMITS = {
  AUTH: { maxRequests: 15, windowMs: 60 * 1000 }, // 15 requests per minute
  DB_WRITE: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 writes per minute
  DB_READ: { maxRequests: 200, windowMs: 60 * 1000 }, // 200 reads per minute
} as const;

// Retry configuration for exponential backoff
export const RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 5000,
};

/**
 * Execute function with automatic retry and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on non-retryable errors
      if (error instanceof RateLimitError) {
        // Wait for the rate limit reset
        await sleep(Math.min(error.resetIn, config.maxDelayMs));
        continue;
      }
      
      if (attempt < config.maxRetries) {
        const delay = Math.min(
          config.baseDelayMs * Math.pow(2, attempt),
          config.maxDelayMs
        );
        console.log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function checkRateLimit(
  userId: string,
  action: string, 
  config: { maxRequests: number; windowMs: number }
): void {
  const result = rateLimiter.check(userId, action, config.maxRequests, config.windowMs);
  
  if (!result.allowed) {
    const resetInSeconds = Math.ceil(result.resetIn / 1000);
    const message = result.inBackoff 
      ? `Por favor aguarde ${resetInSeconds} segundos antes de tentar novamente.`
      : `Muitas requisições. Tente novamente em ${resetInSeconds} segundos.`;
    throw new RateLimitError(message, result.resetIn);
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
