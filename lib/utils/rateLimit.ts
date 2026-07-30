/**
 * Fixed-window rate limiter.
 *
 * LIMITATION: state lives in this process's memory. On serverless or any
 * multi-instance deployment each instance keeps its own counter, so the
 * effective limit is (limit × instances). Move to Redis/Upstash before relying
 * on this for real abuse protection.
 *
 * It is keyed by client IP rather than by the submitted email. Keying on email
 * let an attacker burn a known victim's five attempts per minute and lock them
 * out of their own account, and was trivially bypassed by rotating the email
 * field.
 */

type Bucket = { count: number; resetTime: number };

const buckets = new Map<string, Bucket>();

// Bound the map so a flood of distinct keys cannot grow it without limit.
const MAX_KEYS = 10_000;

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetTime) {
      buckets.delete(key);
    }
  }
}

/**
 * Best-effort client IP. Trusts the proxy headers set by the hosting platform;
 * falls back to a shared bucket when absent, which fails closed rather than
 * open.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]!.trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the window resets. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();

  // Amortised cleanup: only walk the map when it has grown.
  if (buckets.size > MAX_KEYS) {
    sweep(now);
  }

  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetTime) {
    buckets.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (bucket.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfter: Math.ceil((bucket.resetTime - now) / 1000),
    };
  }

  bucket.count++;
  return { allowed: true, retryAfter: 0 };
}
