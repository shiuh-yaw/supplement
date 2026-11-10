import { describe, expect, it } from "vitest";
import {
  DEFAULT_RULES,
  DEFAULT_SUPPLEMENTS,
  SAMPLE_PRODUCTS,
  recommend,
  type KnowledgeBase,
  type UserProfileInput,
} from "@supplement/engine";
import { compareChecks, type HistoryEntry } from "@/lib/history";
import { buildReminderIcs } from "@/lib/reminders";

const kb: KnowledgeBase = { supplements: DEFAULT_SUPPLEMENTS, rules: DEFAULT_RULES, products: SAMPLE_PRODUCTS };
const profile: UserProfileInput = {
  age: 30, sex: "female", weightKg: 55, country: "MY", goal: "strength", trainingDaysPerWeek: 4,
  diet: "vegan", labs: { ferritinUgL: 15 },
};

describe("calendar reminders", () => {
  it("creates a daily event and an every-other-day event for iron", () => {
    const ics = buildReminderIcs(recommend(profile, kb), "08:00", new Date(2026, 10, 10))!;
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART:20261110T080000");
    expect(ics).toContain("RRULE:FREQ=DAILY\r\n");
    expect(ics).toMatch(/RRULE:FREQ=DAILY;INTERVAL=2[\s\S]*SUMMARY:Take \(every other day\): Iron/);
    expect(ics).toMatch(/Vitamin B12: 50–100 µg\/day/);
  });

  it("returns null when nothing is recommended", () => {
    const none = recommend({ ...profile, age: 16 }, kb);
    expect(buildReminderIcs(none)).toBeNull();
  });
});

describe("comparing saved checks", () => {
  const entry = (items: HistoryEntry["items"]): HistoryEntry => ({ id: "x", savedAt: "", profile, items });
  it("reports what started, stopped and changed", () => {
    const older = entry([
      { slug: "iron", name: "Iron", status: "recommended", dose: "60–65 mg iron every other day" },
      { slug: "creatine", name: "Creatine", status: "not_recommended", dose: null },
      { slug: "protein", name: "Protein", status: "recommended", dose: "30–45 g protein/day" },
    ]);
    const newer = entry([
      { slug: "iron", name: "Iron", status: "not_recommended", dose: null },
      { slug: "creatine", name: "Creatine", status: "recommended", dose: "3–5 g/day" },
      { slug: "protein", name: "Protein", status: "recommended", dose: "45–60 g protein/day" },
    ]);
    expect(compareChecks(newer, older)).toEqual([
      "Iron: no longer recommended",
      "Creatine: now recommended (3–5 g/day)",
      "Protein: dose changed to 45–60 g protein/day",
    ]);
  });
});
