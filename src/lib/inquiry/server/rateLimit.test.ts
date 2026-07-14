import { describe, expect, it } from "vitest";

import { createInMemoryRateLimiter } from "./rateLimit";

describe("local rate limiter", () => {
  it("blocks requests beyond the window limit and resets afterwards", async () => {
    const limiter = createInMemoryRateLimiter({ limit: 2, windowMs: 10_000 });

    await expect(limiter.check({ key: "client", now: 1_000 })).resolves.toEqual({
      allowed: true,
    });
    await expect(limiter.check({ key: "client", now: 2_000 })).resolves.toEqual({
      allowed: true,
    });
    await expect(limiter.check({ key: "client", now: 3_000 })).resolves.toEqual({
      allowed: false,
      retryAfterSeconds: 8,
    });
    await expect(limiter.check({ key: "client", now: 11_000 })).resolves.toEqual({
      allowed: true,
    });
  });
});
