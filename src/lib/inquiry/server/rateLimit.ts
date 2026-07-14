export type RateLimitInput = {
  /** Pseudonymous request key. Implementations must not persist a raw IP. */
  key: string;
  now: number;
};

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export interface InquiryRateLimiter {
  check(input: RateLimitInput): Promise<RateLimitResult>;
}

/**
 * Intended only for unit tests and local development. Serverless instances do
 * not share this state, so production must enforce the limit at Cloudflare's
 * edge (WAF/Workers Rate Limiting binding) or inject a distributed limiter.
 */
export function createInMemoryRateLimiter(options?: {
  limit?: number;
  windowMs?: number;
}): InquiryRateLimiter {
  const limit = options?.limit ?? 3;
  const windowMs = options?.windowMs ?? 10 * 60 * 1000;
  const buckets = new Map<string, { count: number; resetsAt: number }>();

  return {
    async check({ key, now }) {
      const existing = buckets.get(key);
      const bucket =
        !existing || existing.resetsAt <= now
          ? { count: 0, resetsAt: now + windowMs }
          : existing;

      bucket.count += 1;
      buckets.set(key, bucket);

      if (bucket.count <= limit) return { allowed: true };
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((bucket.resetsAt - now) / 1_000),
        ),
      };
    },
  };
}
