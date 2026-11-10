import { userProfileSchema, type UserProfileInput } from "@supplement/engine";

/**
 * Share links carry the answers in the URL *fragment* (`#r=...`). Browsers never
 * send the fragment to the server, so shared results are still not stored or logged.
 */
const PARAM = "r";

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** Drops empty values so links stay short. */
function compact(value: unknown): unknown {
  if (Array.isArray(value)) return value.length ? value : undefined;
  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([k, v]) => [k, compact(v)] as const)
      .filter(([, v]) => v !== undefined);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  return value;
}

export function encodeProfile(profile: UserProfileInput): string {
  return toBase64Url(JSON.stringify(compact(profile)));
}

export function decodeProfile(encoded: string): UserProfileInput | null {
  try {
    const parsed = userProfileSchema.safeParse(JSON.parse(fromBase64Url(encoded)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function shareUrl(origin: string, profile: UserProfileInput): string {
  return `${origin}/check#${PARAM}=${encodeProfile(profile)}`;
}

export function readSharedProfile(hash: string): UserProfileInput | null {
  const match = new URLSearchParams(hash.replace(/^#/, "")).get(PARAM);
  return match ? decodeProfile(match) : null;
}

/** "Buy on Shopee" etc., from the link's host. */
export function marketplaceLabel(url: string): string {
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return "Where to buy";
  }
  const known: [RegExp, string][] = [
    [/(^|\.)shopee\./, "Shopee"],
    [/(^|\.)lazada\./, "Lazada"],
    [/(^|\.)tokopedia\.com$/, "Tokopedia"],
    [/(^|\.)tiktok\.com$/, "TikTok Shop"],
    [/(^|\.)iherb\.com$/, "iHerb"],
    [/(^|\.)watsons\./, "Watsons"],
    [/(^|\.)guardian\./, "Guardian"],
  ];
  const hit = known.find(([re]) => re.test(host));
  return hit ? `Buy on ${hit[1]}` : "Where to buy";
}
