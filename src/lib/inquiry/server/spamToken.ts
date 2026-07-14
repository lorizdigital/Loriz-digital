const encoder = new TextEncoder();

const TOKEN_VERSION = 1;
const DEFAULT_TOKEN_TTL_MS = 2 * 60 * 60 * 1000;
const DEFAULT_MINIMUM_DURATION_MS = 5_000;

type StartTokenPayload = {
  version: number;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
};

export type StartTokenVerification =
  | { ok: true; issuedAt: number; expiresAt: number; nonce: string }
  | {
      ok: false;
      reason: "invalid" | "too-fast" | "expired" | "issued-in-future";
    };

type CreateStartTokenOptions = {
  secret: string;
  now?: number;
  ttlMs?: number;
  cryptoImpl?: Crypto;
};

type VerifyStartTokenOptions = {
  token: string;
  secret: string;
  now?: number;
  minimumDurationMs?: number;
  cryptoImpl?: Crypto;
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function fromBase64Url(value: string): Uint8Array | null {
  try {
    const padded = `${value.replaceAll("-", "+").replaceAll("_", "/")}${"=".repeat(
      (4 - (value.length % 4)) % 4,
    )}`;
    const binary = atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

async function sign(
  data: string,
  secret: string,
  cryptoImpl: Crypto,
): Promise<Uint8Array> {
  const key = await cryptoImpl.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(
    await cryptoImpl.subtle.sign("HMAC", key, encoder.encode(data)),
  );
}

export async function derivePseudonymousRateLimitKey(
  value: string,
  secret: string,
  cryptoImpl: Crypto = crypto,
): Promise<string> {
  if (!validSecret(secret)) {
    throw new Error("FORM_TOKEN_SECRET must contain at least 32 bytes.");
  }
  const digest = await sign(`rate-limit:${value}`, secret, cryptoImpl);
  return toBase64Url(digest);
}

function validSecret(secret: string): boolean {
  return encoder.encode(secret).byteLength >= 32;
}

export async function createStartToken({
  secret,
  now = Date.now(),
  ttlMs = DEFAULT_TOKEN_TTL_MS,
  cryptoImpl = crypto,
}: CreateStartTokenOptions): Promise<string> {
  if (!validSecret(secret)) {
    throw new Error("FORM_TOKEN_SECRET must contain at least 32 bytes.");
  }
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
    throw new Error("The start-token lifetime must be positive.");
  }

  const nonceBytes = new Uint8Array(16);
  cryptoImpl.getRandomValues(nonceBytes);
  const payload: StartTokenPayload = {
    version: TOKEN_VERSION,
    issuedAt: now,
    expiresAt: now + ttlMs,
    nonce: toBase64Url(nonceBytes),
  };
  const encodedPayload = toBase64Url(
    encoder.encode(JSON.stringify(payload)),
  );
  const signature = await sign(encodedPayload, secret, cryptoImpl);

  return `${encodedPayload}.${toBase64Url(signature)}`;
}

export async function verifyStartToken({
  token,
  secret,
  now = Date.now(),
  minimumDurationMs = DEFAULT_MINIMUM_DURATION_MS,
  cryptoImpl = crypto,
}: VerifyStartTokenOptions): Promise<StartTokenVerification> {
  if (!validSecret(secret) || !Number.isFinite(minimumDurationMs)) {
    return { ok: false, reason: "invalid" };
  }

  const [encodedPayload, encodedSignature, extraPart] = token.split(".");
  if (!encodedPayload || !encodedSignature || extraPart) {
    return { ok: false, reason: "invalid" };
  }

  const suppliedSignature = fromBase64Url(encodedSignature);
  if (!suppliedSignature) return { ok: false, reason: "invalid" };

  const expectedSignature = await sign(encodedPayload, secret, cryptoImpl);
  if (!timingSafeEqual(suppliedSignature, expectedSignature)) {
    return { ok: false, reason: "invalid" };
  }

  const decodedPayload = fromBase64Url(encodedPayload);
  if (!decodedPayload) return { ok: false, reason: "invalid" };

  let payload: StartTokenPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(decodedPayload)) as StartTokenPayload;
  } catch {
    return { ok: false, reason: "invalid" };
  }

  if (
    payload.version !== TOKEN_VERSION ||
    !Number.isSafeInteger(payload.issuedAt) ||
    !Number.isSafeInteger(payload.expiresAt) ||
    typeof payload.nonce !== "string" ||
    payload.nonce.length < 16 ||
    payload.expiresAt <= payload.issuedAt
  ) {
    return { ok: false, reason: "invalid" };
  }

  if (payload.issuedAt > now + 30_000) {
    return { ok: false, reason: "issued-in-future" };
  }
  if (payload.expiresAt < now) {
    return { ok: false, reason: "expired" };
  }
  if (now - payload.issuedAt < minimumDurationMs) {
    return { ok: false, reason: "too-fast" };
  }

  return {
    ok: true,
    issuedAt: payload.issuedAt,
    expiresAt: payload.expiresAt,
    nonce: payload.nonce,
  };
}
