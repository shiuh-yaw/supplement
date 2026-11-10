import { NextResponse } from "next/server";
import { verifyRegistrationResponse, type RegistrationResponseJSON } from "@simplewebauthn/server";
import { prisma } from "@supplement/db";
import { accountConfig, CONSENT_VERSION } from "@/lib/account/config";
import { setSession, takeChallenge } from "@/lib/account/session";

export async function POST(request: Request) {
  const cfg = accountConfig();
  if (!cfg) return NextResponse.json({ error: "Accounts are off." }, { status: 404 });
  const expected = await takeChallenge("register");
  if (!expected) return NextResponse.json({ error: "This sign-up expired. Please try again." }, { status: 400 });
  const response = (await request.json().catch(() => null)) as RegistrationResponseJSON | null;
  if (!response) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: expected.challenge,
      expectedOrigin: cfg.origin,
      expectedRPID: cfg.rpID,
      requireUserVerification: false,
    });
  } catch (e) {
    console.warn("[accounts] registration failed", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "We couldn't create the passkey. Please try again." }, { status: 400 });
  }
  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "We couldn't create the passkey. Please try again." }, { status: 400 });
  }
  const { credential } = verification.registrationInfo;
  if (await prisma.passkey.findUnique({ where: { id: credential.id } })) {
    return NextResponse.json({ error: "This passkey is already registered. Sign in instead." }, { status: 409 });
  }
  const account = await prisma.account.create({
    data: {
      consentVersion: CONSENT_VERSION,
      consentAt: new Date(),
      passkeys: {
        create: {
          id: credential.id,
          publicKey: Buffer.from(credential.publicKey),
          counter: credential.counter,
          transports: credential.transports ?? [],
        },
      },
    },
  });
  await setSession(account.id);
  return NextResponse.json({ ok: true });
}
