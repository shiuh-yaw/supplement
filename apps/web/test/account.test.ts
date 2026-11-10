import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { decryptJson, encryptJson } from "@/lib/account/crypto";
import { historyEntrySchema } from "@/lib/account/entries";
import { mergeHistory, type HistoryEntry } from "@/lib/history";

const entry = (id: string, savedAt: string): HistoryEntry => ({
  id,
  savedAt,
  profile: { age: 30, sex: "female", weightKg: 55, country: "MY", goal: "strength", trainingDaysPerWeek: 3, diet: "omnivore" },
  items: [{ slug: "creatine", name: "Creatine", status: "recommended", dose: "3–5 g/day" }],
});

describe("account encryption", () => {
  const key = randomBytes(32);
  it("round-trips and is bound to the account", () => {
    const e = entry("1", "2026-11-10T00:00:00.000Z");
    const box = encryptJson(e, key, "acct_a");
    expect(Buffer.from(box).toString("utf8")).not.toContain("creatine");
    expect(decryptJson(box, key, "acct_a")).toEqual(e);
    expect(() => decryptJson(box, key, "acct_b")).toThrow();
    expect(() => decryptJson(box, randomBytes(32), "acct_a")).toThrow();
    const tampered = new Uint8Array(box);
    tampered[40] = tampered[40]! ^ 1;
    expect(() => decryptJson(tampered, key, "acct_a")).toThrow();
  });
});

describe("saved-check validation", () => {
  it("accepts a local history entry and rejects junk", () => {
    expect(historyEntrySchema.safeParse(entry("1", "2026-11-10T00:00:00.000Z")).success).toBe(true);
    expect(historyEntrySchema.safeParse({ ...entry("1", "yesterday") }).success).toBe(false);
    expect(historyEntrySchema.safeParse({ id: "x".repeat(100) }).success).toBe(false);
  });
});

describe("merging history across devices", () => {
  it("keeps one copy of each check, newest first", () => {
    const a = entry("a", "2026-11-01T00:00:00.000Z");
    const b = entry("b", "2026-11-05T00:00:00.000Z");
    const c = entry("c", "2026-11-03T00:00:00.000Z");
    expect(mergeHistory([a, b], [b, c]).map((e) => e.id)).toEqual(["b", "c", "a"]);
  });
});
