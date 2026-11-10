import { NextResponse } from "next/server";
import { prisma } from "@supplement/db";
import { accountConfig } from "@/lib/account/config";
import { decryptJson, encryptJson } from "@/lib/account/crypto";
import { historyEntrySchema, MAX_ACCOUNT_CHECKS, type StoredEntry } from "@/lib/account/entries";
import { sessionAccountId } from "@/lib/account/session";

export const dynamic = "force-dynamic";

async function context() {
  const cfg = accountConfig();
  if (!cfg) return { error: NextResponse.json({ error: "Accounts are off." }, { status: 404 }) } as const;
  const accountId = await sessionAccountId();
  if (!accountId) return { error: NextResponse.json({ error: "Not signed in." }, { status: 401 }) } as const;
  return { cfg, accountId } as const;
}

async function readAll(accountId: string, key: Buffer): Promise<StoredEntry[]> {
  const rows = await prisma.savedCheck.findMany({ where: { accountId }, orderBy: { savedAt: "desc" } });
  const out: StoredEntry[] = [];
  for (const r of rows) {
    try {
      out.push(decryptJson<StoredEntry>(r.payload, key, accountId));
    } catch {
      console.error("[accounts] could not decrypt a saved check", r.id);
    }
  }
  return out;
}

/** The account's saved checks, decrypted for this signed-in browser only. */
export async function GET() {
  const c = await context();
  if ("error" in c) return c.error;
  return NextResponse.json({ entries: await readAll(c.accountId, c.cfg.encryptionKey) }, { headers: { "Cache-Control": "no-store" } });
}

/** Adds checks from this device (existing ids are left as they are), then returns the merged list. */
export async function POST(request: Request) {
  const c = await context();
  if ("error" in c) return c.error;
  const body = (await request.json().catch(() => null)) as { entries?: unknown } | null;
  const parsed = historyEntrySchema.array().max(MAX_ACCOUNT_CHECKS).safeParse(body?.entries);
  if (!parsed.success) return NextResponse.json({ error: "Some saved checks couldn't be read." }, { status: 422 });

  const existing = new Set(
    (await prisma.savedCheck.findMany({ where: { accountId: c.accountId }, select: { clientId: true } })).map((r) => r.clientId),
  );
  const fresh = parsed.data.filter((e) => !existing.has(e.id));
  if (existing.size + fresh.length > MAX_ACCOUNT_CHECKS) {
    return NextResponse.json({ error: `An account keeps up to ${MAX_ACCOUNT_CHECKS} checks. Delete some first.`, code: "full" }, { status: 409 });
  }
  if (fresh.length) {
    await prisma.savedCheck.createMany({
      data: fresh.map((e) => ({
        accountId: c.accountId,
        clientId: e.id,
        savedAt: new Date(e.savedAt),
        payload: encryptJson(e, c.cfg.encryptionKey, c.accountId),
      })),
      skipDuplicates: true,
    });
  }
  return NextResponse.json({ added: fresh.length, entries: await readAll(c.accountId, c.cfg.encryptionKey) });
}

/** Removes one check from the account: DELETE /api/account/checks?id=<clientId> */
export async function DELETE(request: Request) {
  const c = await context();
  if ("error" in c) return c.error;
  const id = new URL(request.url).searchParams.get("id") ?? "";
  await prisma.savedCheck.deleteMany({ where: { accountId: c.accountId, clientId: id } });
  return NextResponse.json({ ok: true });
}
