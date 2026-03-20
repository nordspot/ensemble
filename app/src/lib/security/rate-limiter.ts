interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// ── KV-backed rate limiting with in-memory fallback ──────────────────────

// In-memory fallback for dev / when KV is unavailable
const memoryStore = new Map<string, { count: number; resetAt: number }>();

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

function getKV(): KVNamespace | null {
  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    return (ctx?.env?.ENSEMBLE_KV as KVNamespace) ?? null;
  } catch {
    return null;
  }
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

async function getKVEntry(kv: KVNamespace, key: string): Promise<RateLimitEntry | null> {
  try {
    const raw = await kv.get(`ratelimit:${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as RateLimitEntry;
  } catch {
    return null;
  }
}

async function setKVEntry(
  kv: KVNamespace,
  key: string,
  entry: RateLimitEntry,
  ttlMs: number,
): Promise<void> {
  try {
    await kv.put(`ratelimit:${key}`, JSON.stringify(entry), {
      expirationTtl: Math.ceil(ttlMs / 1000),
    });
  } catch {
    // KV write failed; fall through to memory store
  }
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; resetAt: number } {
  // Synchronous check against memory store
  // KV is checked asynchronously below but we need a sync return
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + config.windowMs });

    // Async: sync to KV if available
    const kv = getKV();
    if (kv) {
      setKVEntry(kv, key, { count: 1, resetAt: now + config.windowMs }, config.windowMs).catch(
        () => {},
      );
    }

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

  // Async: sync to KV
  const kv = getKV();
  if (kv) {
    setKVEntry(kv, key, { count: entry.count, resetAt: entry.resetAt }, entry.resetAt - now).catch(
      () => {},
    );
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Async rate limit check that reads from KV first.
 * Use this when you can afford an async call (e.g., in API routes).
 */
export async function checkRateLimitAsync(
  key: string,
  config: RateLimitConfig,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const kv = getKV();

  if (kv) {
    const kvEntry = await getKVEntry(kv, key);
    if (kvEntry && now <= kvEntry.resetAt) {
      // Sync memory store with KV
      memoryStore.set(key, kvEntry);

      if (kvEntry.count >= config.maxRequests) {
        return { allowed: false, remaining: 0, resetAt: kvEntry.resetAt };
      }

      kvEntry.count++;
      await setKVEntry(kv, key, kvEntry, kvEntry.resetAt - now);
      memoryStore.set(key, kvEntry);

      return {
        allowed: true,
        remaining: config.maxRequests - kvEntry.count,
        resetAt: kvEntry.resetAt,
      };
    }

    // No KV entry or expired -- create new
    const newEntry = { count: 1, resetAt: now + config.windowMs };
    await setKVEntry(kv, key, newEntry, config.windowMs);
    memoryStore.set(key, newEntry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  // No KV available -- use sync memory-only check
  return checkRateLimit(key, config);
}

export const RATE_LIMITS = {
  api: { maxRequests: 100, windowMs: 60000 }, // 100/min
  login: { maxRequests: 5, windowMs: 300000 }, // 5/5min
  registration: { maxRequests: 3, windowMs: 60000 }, // 3/min
  ai: { maxRequests: 20, windowMs: 3600000 }, // 20/hour
  push: { maxRequests: 5, windowMs: 3600000 }, // 5/hour
} as const;
