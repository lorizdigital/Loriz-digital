import { describe, expect, it, vi } from "vitest";

import { sendBrevoEmail, type TransactionalEmail } from "./brevo";
import { verifyTurnstile } from "./turnstile";

const message: TransactionalEmail = {
  sender: { email: "anfragen@send.loriz.digital" },
  to: [{ email: "hallo@loriz.digital" }],
  subject: "Test",
  textContent: "Test",
  htmlContent: "<p>Test</p>",
};

describe("external service adapters", () => {
  it("sends Brevo credentials only in the request header", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ messageId: "mail-1" }), { status: 201 }),
    );
    const result = await sendBrevoEmail({
      apiKey: "test-key",
      message,
      fetchImpl,
    });

    expect(result).toEqual({ ok: true, messageId: "mail-1" });
    const [, init] = fetchImpl.mock.calls[0] as unknown as [
      RequestInfo | URL,
      RequestInit,
    ];
    expect(new Headers(init?.headers).get("api-key")).toBe("test-key");
    expect(String(init?.body)).not.toContain("test-key");
  });

  it("treats a Brevo idempotency duplicate as an already accepted send", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ code: "duplicate_parameter" }), { status: 400 }),
    );
    const result = await sendBrevoEmail({
      apiKey: "test-key",
      message: { ...message, headers: { idempotencyKey: "019f5c48-c6cf-7fc1-8fcc-02ecccea914a" } },
      fetchImpl,
    });

    expect(result).toEqual({
      ok: true,
      messageId: "duplicate:019f5c48-c6cf-7fc1-8fcc-02ecccea914a",
    });
  });

  it("checks Turnstile hostname and action", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          success: true,
          hostname: "loriz.digital",
          action: "project_inquiry",
        }),
      ),
    );

    await expect(
      verifyTurnstile({
        token: "token",
        secret: "secret",
        expectedHostname: "loriz.digital",
        expectedAction: "project_inquiry",
        fetchImpl,
      }),
    ).resolves.toEqual({
      ok: true,
      hostname: "loriz.digital",
      action: "project_inquiry",
    });
  });

  it("fails closed when Turnstile is unavailable", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("offline");
    });

    await expect(
      verifyTurnstile({ token: "token", secret: "secret", fetchImpl }),
    ).resolves.toEqual({ ok: false, reason: "unavailable" });
  });
});
