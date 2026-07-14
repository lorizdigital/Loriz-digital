const BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email";

export type TransactionalEmail = {
  to: Array<{ email: string; name?: string }>;
  sender: { email: string; name?: string };
  subject: string;
  textContent: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
  headers?: Record<string, string>;
};

export type BrevoSendResult =
  | { ok: true; messageId: string }
  | { ok: false; reason: "misconfigured" | "rejected" | "unavailable" };

type BrevoResponse = {
  messageId?: string;
  code?: string;
};

export type SendBrevoEmailOptions = {
  apiKey: string;
  message: TransactionalEmail;
  fetchImpl?: typeof fetch;
};

export async function sendBrevoEmail({
  apiKey,
  message,
  fetchImpl = fetch,
}: SendBrevoEmailOptions): Promise<BrevoSendResult> {
  if (!apiKey) return { ok: false, reason: "misconfigured" };

  let response: Response;
  try {
    response = await fetchImpl(BREVO_SEND_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    return { ok: false, reason: "unavailable" };
  }

  let result: BrevoResponse = {};
  try {
    result = (await response.json()) as BrevoResponse;
  } catch {
    if (response.ok) return { ok: false, reason: "unavailable" };
  }

  // Brevo keeps an idempotency key for 30 minutes. A duplicate response means
  // the original message was already accepted and must not trigger a resend.
  if (
    response.status === 400 &&
    result.code === "duplicate_parameter" &&
    message.headers?.idempotencyKey
  ) {
    return { ok: true, messageId: `duplicate:${message.headers.idempotencyKey}` };
  }

  if (!response.ok) {
    return {
      ok: false,
      reason: response.status >= 500 ? "unavailable" : "rejected",
    };
  }

  if (!result.messageId) return { ok: false, reason: "unavailable" };
  return { ok: true, messageId: result.messageId };
}
