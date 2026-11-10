import type { RecommendationResult, UserProfileInput } from "@supplement/engine";
import { en, type Messages } from "./i18n/messages";

/**
 * Saved checks live in this browser (localStorage). Nothing is sent to our servers
 * unless the person creates an optional account and syncs (see lib/account).
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

/** Union of two histories by id, newest first, capped at the local maximum. */
export function mergeHistory(local: HistoryEntry[], remote: HistoryEntry[]): HistoryEntry[] {
  const byId = new Map<string, HistoryEntry>();
  for (const e of [...local, ...remote]) if (!byId.has(e.id)) byId.set(e.id, e);
  return [...byId.values()].sort((a, b) => b.savedAt.localeCompare(a.savedAt)).slice(0, MAX);
}

/** Replaces this device's history (used after syncing with an account). */
export const replaceHistory = (entries: HistoryEntry[]) => write(entries);

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
