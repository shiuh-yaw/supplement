/**
 * Optional accounts are OFF unless every setting below is present and valid.
 * - ACCOUNTS_ENABLED=true
 * - ACCOUNTS_SECRET: 32+ characters, signs the sign-in cookie
 * - ACCOUNTS_ENCRYPTION_KEY: 32 random bytes, base64 (openssl rand -base64 32), encrypts saved checks
 * - PUBLIC_URL: the site's public address, e.g. https://sukat.example; passkeys are bound to its hostname
 */
export const CONSENT_VERSION = "2026-11-10";

export interface AccountConfig {
  secret: Uint8Array;
  encryptionKey: Buffer;
  rpID: string;
  origin: string;
}

export function accountConfig(): AccountConfig | null {
  if (process.env.ACCOUNTS_ENABLED !== "true") return null;
  const secret = process.env.ACCOUNTS_SECRET ?? "";
  const key = Buffer.from(process.env.ACCOUNTS_ENCRYPTION_KEY ?? "", "base64");
  let url: URL;
  try {
    url = new URL(process.env.PUBLIC_URL ?? "");
  } catch {
    console.error("[accounts] PUBLIC_URL is missing or invalid; accounts stay off");
    return null;
  }
  if (secret.length < 32 || key.length !== 32) {
    console.error("[accounts] ACCOUNTS_SECRET (32+ chars) and ACCOUNTS_ENCRYPTION_KEY (32 bytes, base64) are required; accounts stay off");
    return null;
  }
  return { secret: new TextEncoder().encode(secret), encryptionKey: key, rpID: url.hostname, origin: url.origin };
}

export const accountsEnabled = () => accountConfig() !== null;
