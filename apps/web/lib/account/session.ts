import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { accountConfig } from "./config";

const SESSION = "sukat_account";
const CHALLENGE = "sukat_webauthn";
const SESSION_DAYS = 30;
const secure = () => process.env.NODE_ENV === "production";

export async function setSession(accountId: string) {
  const cfg = accountConfig();
  if (!cfg) return;
  const token = await new SignJWT({ typ: "session" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(accountId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(cfg.secret);
  (await cookies()).set(SESSION, token, { httpOnly: true, secure: secure(), sameSite: "lax", path: "/", maxAge: SESSION_DAYS * 86400 });
}

export async function clearSession() {
  (await cookies()).delete(SESSION);
}

/** Signed-in account id, or null. */
export async function sessionAccountId(): Promise<string | null> {
  const cfg = accountConfig();
  const token = (await cookies()).get(SESSION)?.value;
  if (!cfg || !token) return null;
  try {
    const { payload } = await jwtVerify(token, cfg.secret, { algorithms: ["HS256"] });
    return payload.typ === "session" && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Short-lived signed cookie holding the WebAuthn challenge between "options" and "verify". */
export async function setChallenge(data: { challenge: string; kind: "register" | "login"; userId?: string }) {
  const cfg = accountConfig();
  if (!cfg) return;
  const token = await new SignJWT({ ...data, typ: "challenge" }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("5m").sign(cfg.secret);
  (await cookies()).set(CHALLENGE, token, { httpOnly: true, secure: secure(), sameSite: "strict", path: "/api/account", maxAge: 300 });
}

export async function takeChallenge(kind: "register" | "login"): Promise<{ challenge: string; userId?: string } | null> {
  const cfg = accountConfig();
  const store = await cookies();
  const token = store.get(CHALLENGE)?.value;
  store.delete({ name: CHALLENGE, path: "/api/account" });
  if (!cfg || !token) return null;
  try {
    const { payload } = await jwtVerify(token, cfg.secret, { algorithms: ["HS256"] });
    if (payload.typ !== "challenge" || payload.kind !== kind || typeof payload.challenge !== "string") return null;
    return { challenge: payload.challenge, userId: typeof payload.userId === "string" ? payload.userId : undefined };
  } catch {
    return null;
  }
}
