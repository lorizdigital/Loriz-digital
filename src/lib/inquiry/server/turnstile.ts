const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileApiResponse = {
  success?: boolean;
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
  "error-codes"?: string[];
};

export type TurnstileVerification =
  | { ok: true; hostname?: string; action?: string }
  | { ok: false; reason: "invalid" | "misconfigured" | "unavailable" };

export type VerifyTurnstileOptions = {
  token: string;
  secret: string;
  remoteIp?: string;
  expectedHostname?: string;
  expectedAction?: string;
  idempotencyKey?: string;
  fetchImpl?: typeof fetch;
};

export async function verifyTurnstile({
  token,
  secret,
  remoteIp,
  expectedHostname,
  expectedAction,
  idempotencyKey,
  fetchImpl = fetch,
}: VerifyTurnstileOptions): Promise<TurnstileVerification> {
  if (!secret || !token) return { ok: false, reason: "misconfigured" };

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  if (idempotencyKey) body.set("idempotency_key", idempotencyKey);

  let response: Response;
  try {
    response = await fetchImpl(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    return { ok: false, reason: "unavailable" };
  }

  if (!response.ok) return { ok: false, reason: "unavailable" };

  let result: TurnstileApiResponse;
  try {
    result = (await response.json()) as TurnstileApiResponse;
  } catch {
    return { ok: false, reason: "unavailable" };
  }

  if (!result.success) return { ok: false, reason: "invalid" };
  if (expectedHostname && result.hostname !== expectedHostname) {
    return { ok: false, reason: "invalid" };
  }
  if (expectedAction && result.action !== expectedAction) {
    return { ok: false, reason: "invalid" };
  }

  return { ok: true, hostname: result.hostname, action: result.action };
}
