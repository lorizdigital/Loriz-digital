import { safeParseInquirySubmission } from "@/lib/inquiry/schema";
import type { InquirySubmission } from "@/lib/inquiry/types";
import { sendBrevoEmail } from "@/lib/inquiry/server/brevo";
import {
  buildInquiryConfirmationEmail,
  buildInquiryNotificationEmail,
} from "@/lib/inquiry/server/emailFormat";
import { normalizeInquiryInput } from "@/lib/inquiry/server/normalizeInput";
import { presentInquiryForEmail } from "@/lib/inquiry/server/presentInquiry";
import { createInMemoryRateLimiter } from "@/lib/inquiry/server/rateLimit";
import { createInquiryRouteHandlers } from "@/lib/inquiry/server/routeHandler";
import {
  createStartToken,
  verifyStartToken,
} from "@/lib/inquiry/server/spamToken";
import { verifyTurnstile } from "@/lib/inquiry/server/turnstile";

// This is a per-isolate safety net. Cloudflare edge rate limiting remains
// required for a distributed production limit across Worker isolates.
const rateLimiter = createInMemoryRateLimiter({ limit: 3, windowMs: 10 * 60 * 1_000 });

function environment() {
  return {
    brevoApiKey: process.env.BREVO_API_KEY ?? "",
    fromEmail: process.env.PROJECT_INQUIRY_FROM_EMAIL ?? "",
    fromName: process.env.PROJECT_INQUIRY_FROM_NAME ?? "",
    toEmail: process.env.PROJECT_INQUIRY_TO_EMAIL ?? "",
    allowedOrigin: process.env.PROJECT_INQUIRY_ALLOWED_ORIGIN ?? "",
    tokenSecret: process.env.FORM_TOKEN_SECRET ?? "",
    turnstileSecret: process.env.TURNSTILE_SECRET_KEY ?? "",
    turnstileExpectedHostname: process.env.TURNSTILE_EXPECTED_HOSTNAME ?? "",
  };
}

function fieldErrors(issues: Array<{ path: PropertyKey[]; message: string }>) {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "form";
    errors[key] = [...(errors[key] ?? []), issue.message];
  }
  return errors;
}

function handlers() {
  const env = environment();
  const identity = { fromEmail: env.fromEmail, fromName: env.fromName };

  return createInquiryRouteHandlers<InquirySubmission>({
    env,
    rateLimiter,
    createStartToken: () =>
      createStartToken({
        secret: env.tokenSecret,
      }),
    verifyStartToken: (token) =>
      verifyStartToken({
        token,
        secret: env.tokenSecret,
      }),
    verifyTurnstile: ({
      token,
      remoteIp,
      idempotencyKey,
      expectedAction,
    }) =>
      verifyTurnstile({
        token,
        secret: env.turnstileSecret,
        remoteIp,
        idempotencyKey,
        expectedAction,
        expectedHostname: env.turnstileExpectedHostname,
      }),
    validateSubmission(input) {
      const result = safeParseInquirySubmission(normalizeInquiryInput(input));
      if (!result.success) {
        return {
          success: false,
          fieldErrors: fieldErrors(result.error.issues),
        };
      }
      return { success: true, data: result.data as InquirySubmission };
    },
    presentInquiry: presentInquiryForEmail,
    buildNotification: ({ requestId, inquiry }) =>
      buildInquiryNotificationEmail({
        requestId,
        recipient: env.toEmail,
        identity,
        inquiry,
      }),
    buildConfirmation: ({ requestId, inquiry }) =>
      buildInquiryConfirmationEmail({
        requestId,
        identity,
        contactEmail: env.toEmail,
        recipient: {
          email: inquiry.contact.email,
          name: inquiry.contact.name,
        },
      }),
    sendEmail: (message) =>
      sendBrevoEmail({ apiKey: env.brevoApiKey, message }),
  });
}

export async function GET(): Promise<Response> {
  return handlers().GET();
}

export async function POST(request: Request): Promise<Response> {
  return handlers().POST(request);
}
