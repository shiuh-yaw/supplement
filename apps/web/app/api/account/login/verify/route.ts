import { NextResponse } from "next/server";
import { verifyAuthenticationResponse, type AuthenticationResponseJSON, type AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { prisma } from "@supplement/db";
import { accountConfig } from "@/lib/account/config";
import { setSession, takeChallenge } from "@/lib/account/session";

export async function POST(request: Request) {
  const cfg = accountConfig();
  if (!cfg) return NextResponse.json({ error: "Accounts are off." }, { status: 404 });
  const expected = await takeChallenge("login");
  if (!expected) return NextResponse.json({ error: "This sign-in expired. Please try again." }, { status: 400 });
  const response = (await request.json().catch(() => null)) as AuthenticationResponseJSON | null;
  if (!response?.id) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const passkey = await prisma.passkey.findUnique({ where: { id: response.id } });
  if (!passkey) return NextResponse.json({ error: "We don't recognise this passkey. It may belong to a deleted account." }, { status: 404 });
  try {
    const result = await verifyAuthenticationResponse({
      response,
      expectedChallenge: expected.challenge,
      expectedOrigin: cfg.origin,
      expectedRPID: cfg.rpID,
      credential: {
        id: passkey.id,
        publicKey: new Uint8Array(passkey.publicKey),
        counter: passkey.counter,
        transports: passkey.transports as AuthenticatorTransportFuture[],
      },
      requireUserVerification: false,
    });
    if (!result.verified) throw new Error("not verified");
    await prisma.passkey.update({ where: { id: passkey.id }, data: { counter: result.authenticationInfo.newCounter } });
    await prisma.account.update({ where: { id: passkey.accountId }, data: { lastSeenAt: new Date() } });
  } catch (e) {
    console.warn("[accounts] sign-in failed", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "We couldn't sign you in. Please try again." }, { status: 400 });
  }
  await setSession(passkey.accountId);
  return NextResponse.json({ ok: true });
}
