import type { InquiryRateLimiter } from "./rateLimit";
import { derivePseudonymousRateLimitKey } from "./spamToken";
import type { InquiryEmailData } from "./emailFormat";
import type { TransactionalEmail } from "./brevo";

const MAX_REQUEST_BYTES = 32 * 1024;
const TURNSTILE_ACTION = "project_inquiry";

export type InquiryRouteEnvironment = {
  brevoApiKey: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  allowedOrigin: string;
  tokenSecret: string;
  turnstileSecret: string;
  turnstileExpectedHostname: string;
};

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; fieldErrors?: Record<string, string[]> };

type StartTokenResult =
  | { ok: true; nonce: string }
  | { ok: false; reason: string };

type ServiceResult = { ok: true } | { ok: false; reason: string };

export type InquiryRouteDependencies<T> = {
  env: InquiryRouteEnvironment;
  rateLimiter: InquiryRateLimiter;
  createStartToken(): Promise<string>;
  verifyStartToken(token: string): Promise<StartTokenResult>;
  verifyTurnstile(input: {
    token: string;
    remoteIp?: string;
    idempotencyKey: string;
    expectedAction: string;
  }): Promise<ServiceResult>;
  validateSubmission(input: unknown): ValidationResult<T>;
  presentInquiry(submission: T): InquiryEmailData;
  buildNotification(input: {
    requestId: string;
    inquiry: InquiryEmailData;
  }): TransactionalEmail;
  buildConfirmation(input: {
    requestId: string;
    inquiry: InquiryEmailData;
  }): TransactionalEmail;
  sendEmail(message: TransactionalEmail): Promise<ServiceResult>;
  now?: () => number;
};

type SubmissionEnvelope = {
  submission: unknown;
  startToken: string;
  turnstileToken: string;
  honeypot: string;
  idempotencyKey: string;
};

function json(body: unknown, status: number, headers?: HeadersInit): Response {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      ...Object.fromEntries(new Headers(headers)),
    },
  });
}

function error(
  status: number,
  code: string,
  message: string,
  fieldErrors?: Record<string, string[]>,
  headers?: HeadersInit,
): Response {
  return json(
    { ok: false, code, message, ...(fieldErrors ? { fieldErrors } : {}) },
    status,
    headers,
  );
}

function configured(env: InquiryRouteEnvironment): boolean {
  return Object.values(env).every((value) => value.trim().length > 0);
}

function readEnvelope(input: unknown): SubmissionEnvelope | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  const knownKeys = new Set([
    "submission",
    "startToken",
    "turnstileToken",
    "honeypot",
    "idempotencyKey",
  ]);
  if (Object.keys(value).some((key) => !knownKeys.has(key))) return null;
  if (
    !("submission" in value) ||
    typeof value.startToken !== "string" ||
    typeof value.turnstileToken !== "string" ||
    typeof value.honeypot !== "string" ||
    typeof value.idempotencyKey !== "string" ||
    value.startToken.length > 2_000 ||
    value.turnstileToken.length > 4_096 ||
    value.honeypot.length > 200 ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
      value.idempotencyKey,
    )
  ) {
    return null;
  }

  return value as SubmissionEnvelope;
}

function clientIp(request: Request): string | undefined {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    undefined
  );
}

export function createInquiryRouteHandlers<T>(
  dependencies: InquiryRouteDependencies<T>,
): { GET: () => Promise<Response>; POST: (request: Request) => Promise<Response> } {
  const now = dependencies.now ?? Date.now;

  return {
    async GET() {
      if (!dependencies.env.tokenSecret) {
        return error(
          503,
          "configuration_error",
          "Das Anfrageformular ist derzeit nicht verfügbar.",
        );
      }

      try {
        const startToken = await dependencies.createStartToken();
        return json({ startToken }, 200);
      } catch {
        return error(
          503,
          "configuration_error",
          "Das Anfrageformular ist derzeit nicht verfügbar.",
        );
      }
    },

    async POST(request) {
      if (!configured(dependencies.env)) {
        return error(
          503,
          "configuration_error",
          "Das Anfrageformular ist derzeit nicht verfügbar.",
        );
      }
      if (request.headers.get("content-type")?.split(";")[0] !== "application/json") {
        return error(415, "invalid_request", "Bitte senden Sie gültige Formulardaten.");
      }
      if (request.headers.get("origin") !== dependencies.env.allowedOrigin) {
        return error(403, "verification_failed", "Die Anfrage konnte nicht geprüft werden.");
      }
      if (new URL(request.url).origin !== dependencies.env.allowedOrigin) {
        return error(403, "verification_failed", "Die Anfrage konnte nicht geprüft werden.");
      }

      const declaredLength = Number(request.headers.get("content-length"));
      if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
        return error(413, "invalid_request", "Die Anfrage ist zu umfangreich.");
      }

      let raw: string;
      try {
        raw = await request.text();
      } catch {
        return error(400, "invalid_request", "Bitte senden Sie gültige Formulardaten.");
      }
      if (new TextEncoder().encode(raw).byteLength > MAX_REQUEST_BYTES) {
        return error(413, "invalid_request", "Die Anfrage ist zu umfangreich.");
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw) as unknown;
      } catch {
        return error(400, "invalid_request", "Bitte senden Sie gültige Formulardaten.");
      }
      const envelope = readEnvelope(parsed);
      if (!envelope) {
        return error(400, "invalid_request", "Bitte prüfen Sie die Formulardaten.");
      }

      const requestId = envelope.idempotencyKey;
      if (envelope.honeypot.trim()) {
        return json({ ok: true, requestId }, 200);
      }

      const startToken = await dependencies.verifyStartToken(envelope.startToken);
      if (!startToken.ok) {
        return error(
          403,
          startToken.reason === "expired" ? "start_token_expired" : "verification_failed",
          startToken.reason === "expired"
            ? "Die Anfrage war zu lange geöffnet. Die Sicherheitsprüfung wurde erneuert."
            : "Die Anfrage konnte nicht geprüft werden.",
        );
      }

      const ip = clientIp(request);
      const rateLimitKey = await derivePseudonymousRateLimitKey(
        ip ?? `no-ip:${request.headers.get("user-agent") ?? "unknown"}`,
        dependencies.env.tokenSecret,
      );
      const rateLimit = await dependencies.rateLimiter.check({
        key: rateLimitKey,
        now: now(),
      });
      if (!rateLimit.allowed) {
        return error(
          429,
          "rate_limited",
          "Bitte warten Sie einen Moment und versuchen Sie es erneut.",
          undefined,
          { "retry-after": String(rateLimit.retryAfterSeconds) },
        );
      }

      const turnstile = await dependencies.verifyTurnstile({
        token: envelope.turnstileToken,
        remoteIp: ip,
        idempotencyKey: requestId,
        expectedAction: TURNSTILE_ACTION,
      });
      if (!turnstile.ok) {
        return error(403, "verification_failed", "Die Anfrage konnte nicht geprüft werden.");
      }

      let validation: ValidationResult<T>;
      try {
        validation = dependencies.validateSubmission(envelope.submission);
      } catch {
        return error(400, "invalid_submission", "Bitte prüfen Sie Ihre Angaben.");
      }
      if (!validation.success) {
        return error(
          400,
          "invalid_submission",
          "Bitte prüfen Sie Ihre Angaben.",
          validation.fieldErrors,
        );
      }

      const inquiry = dependencies.presentInquiry(validation.data);
      const notification = await dependencies.sendEmail(
        dependencies.buildNotification({ requestId, inquiry }),
      );
      if (!notification.ok) {
        return error(
          502,
          "delivery_failed",
          "Ihre Anfrage konnte noch nicht gesendet werden. Ihre Angaben bleiben erhalten.",
        );
      }

      const confirmation = await dependencies.sendEmail(
        dependencies.buildConfirmation({ requestId, inquiry }),
      );
      if (!confirmation.ok) {
        return error(
          502,
          "confirmation_failed",
          "Ihre Anfrage ist eingegangen, die Eingangsbestätigung konnte jedoch noch nicht versendet werden. Bitte versuchen Sie es erneut.",
        );
      }

      return json({ ok: true, requestId }, 200);
    },
  };
}
