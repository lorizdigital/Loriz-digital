import { describe, expect, it, vi } from "vitest";

import { createInquiryRouteHandlers } from "./routeHandler";
import type { InquiryRateLimiter } from "./rateLimit";

const env = {
  brevoApiKey: "test",
  fromEmail: "anfragen@send.loriz.digital",
  fromName: "Loriz Digital",
  toEmail: "hallo@loriz.digital",
  allowedOrigin: "https://loriz.digital",
  tokenSecret: "a-secure-test-secret-with-more-than-32-bytes",
  turnstileSecret: "test",
  turnstileExpectedHostname: "loriz.digital",
};

function request(body: unknown): Request {
  return new Request("https://loriz.digital/api/project-inquiries", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://loriz.digital",
      "cf-connecting-ip": "192.0.2.1",
    },
    body: JSON.stringify(body),
  });
}

function dependencies(overrides?: Record<string, unknown>) {
  const sendEmail = vi.fn(async () => ({ ok: true as const }));
  const rateLimiter: InquiryRateLimiter = {
    check: vi.fn(async () => ({ allowed: true as const })),
  };
  return {
    env,
    rateLimiter,
    createStartToken: vi.fn(async () => "start-token"),
    verifyStartToken: vi.fn(async () => ({ ok: true as const, nonce: "nonce" })),
    verifyTurnstile: vi.fn(async () => ({ ok: true as const })),
    validateSubmission: vi.fn(() => ({
      success: true as const,
      data: { contact: { email: "kunde@example.com" } },
    })),
    presentInquiry: vi.fn(() => ({
      projectType: "Neue Webseite",
      contact: {
        name: "Kunde",
        email: "kunde@example.com",
        preferredContact: "E-Mail",
      },
      sections: [],
    })),
    buildNotification: vi.fn(() => ({
      sender: { email: env.fromEmail },
      to: [{ email: env.toEmail }],
      subject: "Projektanfrage",
      textContent: "Test",
      htmlContent: "<p>Test</p>",
    })),
    buildConfirmation: vi.fn(() => ({
      sender: { email: env.fromEmail },
      to: [{ email: "kunde@example.com" }],
      subject: "Bestätigung",
      textContent: "Test",
      htmlContent: "<p>Test</p>",
    })),
    sendEmail,
    ...overrides,
  };
}

const validEnvelope = {
  submission: { projectType: "new_website" },
  startToken: "start-token",
  turnstileToken: "turnstile-token",
  honeypot: "",
  idempotencyKey: "019f5c48-c6cf-7fc1-8fcc-02ecccea914a",
};

describe("project inquiry route", () => {
  it("issues an uncached start token", async () => {
    const handlers = createInquiryRouteHandlers(dependencies());
    const response = await handlers.GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ startToken: "start-token" });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("sends the notification and concise confirmation after validation", async () => {
    const deps = dependencies();
    const handlers = createInquiryRouteHandlers(deps);
    const response = await handlers.POST(request(validEnvelope));

    expect(response.status).toBe(200);
    expect(deps.sendEmail).toHaveBeenCalledTimes(2);
    expect(deps.verifyTurnstile).toHaveBeenCalledWith(
      expect.objectContaining({ expectedAction: "project_inquiry" }),
    );
  });

  it("does not send email for a filled honeypot", async () => {
    const deps = dependencies();
    const handlers = createInquiryRouteHandlers(deps);
    const response = await handlers.POST(
      request({ ...validEnvelope, honeypot: "https://spam.example" }),
    );

    expect(response.status).toBe(200);
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });

  it("retains a retryable error when delivery fails", async () => {
    const deps = dependencies({
      sendEmail: vi.fn(async () => ({ ok: false as const, reason: "unavailable" })),
    });
    const handlers = createInquiryRouteHandlers(deps);
    const response = await handlers.POST(request(validEnvelope));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: "delivery_failed",
    });
  });

  it("reports a failed confirmation without losing the accepted inquiry", async () => {
    const sendEmail = vi
      .fn()
      .mockResolvedValueOnce({ ok: true as const })
      .mockResolvedValueOnce({ ok: false as const, reason: "unavailable" });
    const handlers = createInquiryRouteHandlers(dependencies({ sendEmail }));
    const response = await handlers.POST(request(validEnvelope));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: "confirmation_failed",
    });
  });

  it("distinguishes an expired start token so the client can renew it", async () => {
    const handlers = createInquiryRouteHandlers(
      dependencies({
        verifyStartToken: vi.fn(async () => ({ ok: false as const, reason: "expired" })),
      }),
    );
    const response = await handlers.POST(request(validEnvelope));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ code: "start_token_expired" });
  });

  it("rejects a request from an unexpected origin", async () => {
    const handlers = createInquiryRouteHandlers(dependencies());
    const hostileRequest = new Request(
      "https://loriz.digital/api/project-inquiries",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://attacker.example",
        },
        body: JSON.stringify(validEnvelope),
      },
    );
    const response = await handlers.POST(hostileRequest);

    expect(response.status).toBe(403);
  });

  it("rejects unsupported content types and oversized bodies", async () => {
    const handlers = createInquiryRouteHandlers(dependencies());
    const unsupported = new Request("https://loriz.digital/api/project-inquiries", {
      method: "POST",
      headers: { "content-type": "text/plain", origin: "https://loriz.digital" },
      body: "invalid",
    });
    expect((await handlers.POST(unsupported)).status).toBe(415);

    const oversized = new Request("https://loriz.digital/api/project-inquiries", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": "40000",
        origin: "https://loriz.digital",
      },
      body: JSON.stringify(validEnvelope),
    });
    expect((await handlers.POST(oversized)).status).toBe(413);
  });

  it("enforces rate limiting before Turnstile and delivery", async () => {
    const deps = dependencies({
      rateLimiter: {
        check: vi.fn(async () => ({ allowed: false as const, retryAfterSeconds: 60 })),
      },
    });
    const response = await createInquiryRouteHandlers(deps).POST(request(validEnvelope));

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(deps.verifyTurnstile).not.toHaveBeenCalled();
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });

  it("fails closed when Turnstile rejects the request", async () => {
    const deps = dependencies({
      verifyTurnstile: vi.fn(async () => ({ ok: false as const, reason: "rejected" })),
    });
    const response = await createInquiryRouteHandlers(deps).POST(request(validEnvelope));

    expect(response.status).toBe(403);
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });

  it("turns validator exceptions into a controlled client error", async () => {
    const deps = dependencies({
      validateSubmission: vi.fn(() => {
        throw new RangeError("too deep");
      }),
    });
    const response = await createInquiryRouteHandlers(deps).POST(request(validEnvelope));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: "invalid_submission" });
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });
});
