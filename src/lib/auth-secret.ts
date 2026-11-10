/**
 * Single source of truth for the session signing key.
 *
 * Production deployments must set AUTH_SECRET (32+ characters). The local
 * development fallback exists only so `npm run dev` works without extra setup;
 * it is never used when NODE_ENV is "production".
 */
export const SESSION_COOKIE_NAME = "dokanman_session";

const DEV_FALLBACK_SECRET = "dokanman-local-development-only-secret";

let cachedValue: string | null = null;
let cachedKey: Uint8Array | null = null;

export function getAuthSecret(): Uint8Array {
  const configured = process.env.AUTH_SECRET?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  if (!configured) {
    if (isProduction) {
      throw new Error(
        "AUTH_SECRET is not set. Add a 32+ character secret to the deployment environment (for example `vercel env add AUTH_SECRET`) and redeploy."
      );
    }
    return new TextEncoder().encode(DEV_FALLBACK_SECRET);
  }

  if (isProduction && configured.length < 32) {
    throw new Error("AUTH_SECRET is too short. Use at least 32 characters, e.g. `openssl rand -base64 48`.");
  }

  if (cachedValue !== configured || !cachedKey) {
    cachedValue = configured;
    cachedKey = new TextEncoder().encode(configured);
  }
  return cachedKey;
}
