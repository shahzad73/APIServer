// src/utils/apiKeyUtils.ts
import crypto from "crypto";

const HMAC_SECRET = process.env.API_KEY_HMAC_SECRET!;
if (!HMAC_SECRET) {
  throw new Error("API_KEY_HMAC_SECRET is required in env");
}

// Generate a new pair: kid + secret (plaintext returned to caller only once)
export function generateApiKeyPair(): { kid: string; secret: string; apiKey: string } {
  // kid: short id (random hex)
  const kid = crypto.randomBytes(12).toString("hex"); // 24 chars
  // secret: long random token (base64url)
  const secret = crypto.randomBytes(32).toString("base64url");
  const apiKey = `${kid}.${secret}`;
  return { kid, secret, apiKey };
}

// Hash the secret using HMAC-SHA256 with server secret
export function hashSecret(secret: string): string {
  return crypto.createHmac("sha256", HMAC_SECRET).update(secret).digest("hex");
}

// Constant-time compare
export function safeCompare(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // compare anyway to avoid timing difference
    return crypto.timingSafeEqual(
      Buffer.alloc(Math.max(ab.length, bb.length)),
      Buffer.alloc(Math.max(ab.length, bb.length))
    ) && false;
  }
  return crypto.timingSafeEqual(ab, bb);
}

