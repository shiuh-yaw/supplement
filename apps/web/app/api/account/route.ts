import { NextResponse } from "next/server";
import { prisma } from "@supplement/db";
import { accountsEnabled } from "@/lib/account/config";
import { clearSession, sessionAccountId } from "@/lib/account/session";

export const dynamic = "force-dynamic";

/** Whether accounts are on, and whether this browser is signed in. */
export async function GET() {
  if (!accountsEnabled()) return NextResponse.json({ enabled: false, signedIn: false });
  const id = await sessionAccountId();
  const account = id ? await prisma.account.findUnique({ where: { id }, include: { _count: { select: { checks: true, passkeys: true } } } }) : null;
  return NextResponse.json(
    {
      enabled: true,
      signedIn: Boolean(account),
      checks: account?._count.checks ?? 0,
      createdAt: account?.createdAt ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Deletes the account and everything in it. Immediate and permanent. */
export async function DELETE() {
  if (!accountsEnabled()) return NextResponse.json({ error: "Accounts are off." }, { status: 404 });
  const id = await sessionAccountId();
  if (!id) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  await prisma.account.deleteMany({ where: { id } }); // passkeys and checks cascade
  await clearSession();
  return NextResponse.json({ ok: true });
}
