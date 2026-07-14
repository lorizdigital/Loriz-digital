import { describe, expect, it } from "vitest";

import { createStartToken, verifyStartToken } from "./spamToken";

const secret = "a-secure-test-secret-with-more-than-32-bytes";

describe("start token", () => {
  it("accepts a signed token after the minimum duration", async () => {
    const token = await createStartToken({ secret, now: 1_000, ttlMs: 60_000 });
    const result = await verifyStartToken({
      token,
      secret,
      now: 7_000,
      minimumDurationMs: 5_000,
    });

    expect(result.ok).toBe(true);
  });

  it("rejects submissions that arrive too quickly", async () => {
    const token = await createStartToken({ secret, now: 1_000 });
    await expect(
      verifyStartToken({ token, secret, now: 2_000, minimumDurationMs: 5_000 }),
    ).resolves.toEqual({ ok: false, reason: "too-fast" });
  });

  it("rejects expired and tampered tokens", async () => {
    const token = await createStartToken({ secret, now: 1_000, ttlMs: 2_000 });

    await expect(
      verifyStartToken({ token, secret, now: 4_000, minimumDurationMs: 0 }),
    ).resolves.toEqual({ ok: false, reason: "expired" });
    await expect(
      verifyStartToken({
        token: `${token.startsWith("a") ? "b" : "a"}${token.slice(1)}`,
        secret,
        now: 2_000,
        minimumDurationMs: 0,
      }),
    ).resolves.toEqual({ ok: false, reason: "invalid" });
  });
});
