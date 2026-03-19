interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// Simple in-memory rate limiter for dev (use KV in production)
const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

export const RATE_LIMITS = {
  api: { maxRequests: 100, windowMs: 60000 }, // 100/min
  login: { maxRequests: 5, windowMs: 300000 }, // 5/5min
  registration: { maxRequests: 3, windowMs: 60000 }, // 3/min
  ai: { maxRequests: 20, windowMs: 3600000 }, // 20/hour
  push: { maxRequests: 5, windowMs: 3600000 }, // 5/hour
} as const;
