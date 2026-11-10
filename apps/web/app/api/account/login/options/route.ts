import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { accountConfig } from "@/lib/account/config";
import { limited } from "@/lib/account/rate-limit";
import { setChallenge } from "@/lib/account/session";

export async function POST(request: Request) {
  const cfg = accountConfig();
  if (!cfg) return NextResponse.json({ error: "Accounts are off." }, { status: 404 });
  if (limited(request, "login", 30)) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  // Discoverable credentials: the phone offers the person's Sukat passkey; we don't ask who they are.
  const options = await generateAuthenticationOptions({ rpID: cfg.rpID, userVerification: "preferred" });
  await setChallenge({ challenge: options.challenge, kind: "login" });
  return NextResponse.json(options);
}
