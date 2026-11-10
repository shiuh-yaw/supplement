import { NextResponse } from "next/server";
import { prisma } from "@supplement/db";
import { accountConfig } from "@/lib/account/config";
import { decryptJson } from "@/lib/account/crypto";
import type { StoredEntry } from "@/lib/account/entries";
import { sessionAccountId } from "@/lib/account/session";

export const dynamic = "force-dynamic";

/** Everything Sukat holds about this account, as a JSON file (data-portability right). */
export async function GET() {
  const cfg = accountConfig();
  if (!cfg) return NextResponse.json({ error: "Accounts are off." }, { status: 404 });
  const accountId = await sessionAccountId();
  if (!accountId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const account = await prisma.account.findUnique({ where: { id: accountId }, include: { passkeys: true, checks: true } });
  if (!account) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const data = {
    exportedAt: new Date().toISOString(),
    account: { createdAt: account.createdAt, consentVersion: account.consentVersion, consentAt: account.consentAt, lastSeenAt: account.lastSeenAt },
    passkeys: account.passkeys.map((p) => ({ createdAt: p.createdAt, transports: p.transports })),
    checks: account.checks.map((r) => decryptJson<StoredEntry>(r.payload, cfg.encryptionKey, accountId)),
  };
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="sukat-account-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
