"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma, writeAudit } from "@supplement/db";
import { SESSION_COOKIE, SESSION_HOURS, signSession } from "@/lib/session-token";

// Real hash of a random string, compared against when the email is unknown.
const DUMMY_HASH = bcrypt.hashSync(crypto.randomUUID(), 12);

export async function login(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.adminUser.findUnique({ where: { email } });

  // Always run bcrypt so response time doesn't reveal whether the email exists.
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !user.active || !ok) return { error: "Wrong email or password." };

  const token = await signSession({ sub: user.id, role: user.role, name: user.name });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
  await writeAudit({ userId: user.id, action: "login", entity: "AdminUser", entityId: user.id });
  redirect("/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
