import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { accountConfig, CONSENT_VERSION } from "@/lib/account/config";
import { limited } from "@/lib/account/rate-limit";
import { setChallenge } from "@/lib/account/session";

export async function POST(request: Request) {
  const cfg = accountConfig();
  if (!cfg) return NextResponse.json({ error: "Accounts are off." }, { status: 404 });
  if (limited(request, "register")) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  const body = (await request.json().catch(() => ({}))) as { consent?: unknown; consentVersion?: unknown };
  if (body.consent !== true || body.consentVersion !== CONSENT_VERSION) {
    return NextResponse.json({ error: "Consent is required.", code: "noConsent" }, { status: 400 });
  }
  const userId = crypto.getRandomValues(new Uint8Array(32));
  const options = await generateRegistrationOptions({
    rpName: "Sukat",
    rpID: cfg.rpID,
    userName: "Sukat",
    userDisplayName: "Sukat",
    userID: userId,
    attestationType: "none",
    authenticatorSelection: { residentKey: "required", userVerification: "preferred" },
  });
  await setChallenge({ challenge: options.challenge, kind: "register", userId: Buffer.from(userId).toString("base64url") });
  return NextResponse.json(options);
}
