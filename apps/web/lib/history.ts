import type { RecommendationResult, UserProfileInput } from "@supplement/engine";
import { en, type Messages } from "./i18n/messages";

/**
 * Saved checks live only in this browser (localStorage). Nothing is sent to our
 * servers, which keeps the "we don't store your health data" promise.
 */
const KEY = "sukat.history.v1";
const MAX = 20;

export interface HistoryItem {
  slug: string;
  name: string;
  status: RecommendationResult["items"][number]["status"];
  dose: string | null;
}

export interface HistoryEntry {
  id: string;
  savedAt: string;
  profile: UserProfileInput;
  items: HistoryItem[];
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(entries: HistoryEntry[]): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)));
    return true;
  } catch {
    return false;
  }
}

export function saveCheck(profile: UserProfileInput, result: RecommendationResult): boolean {
  const entry: HistoryEntry = {
    id: `${Date.now()}`,
    savedAt: new Date().toISOString(),
    profile,
    items: result.items.map((i) => ({
      slug: i.supplement.slug,
      name: i.supplement.name,
      status: i.status,
      dose: i.dose?.text ?? null,
    })),
  };
  return write([entry, ...loadHistory()]);
}

export const deleteCheck = (id: string) => write(loadHistory().filter((e) => e.id !== id));
export const clearHistory = () => write([]);

/** Differences between two checks, newest first: what started, stopped or changed. */
export function compareChecks(newer: HistoryEntry, older: HistoryEntry, m: Messages["history"] = en.history): string[] {
  const before = new Map(older.items.map((i) => [i.slug, i]));
  const changes: string[] = [];
  for (const now of newer.items) {
    const was = before.get(now.slug);
    const nowOn = now.status === "recommended";
    const wasOn = was?.status === "recommended";
    if (nowOn && !wasOn) changes.push(m.nowRecommended(now.name, now.dose));
    else if (!nowOn && wasOn) changes.push(m.noLonger(now.name));
    else if (nowOn && wasOn && now.dose !== was?.dose) changes.push(m.doseChanged(now.name, now.dose));
    if (now.status === "blocked" && was?.status !== "blocked") changes.push(m.needsDoctor(now.name));
  }
  return changes;
}
