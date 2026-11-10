"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fromSi, type UserProfileInput } from "@supplement/engine";
import { useI18n } from "@/lib/i18n/context";
import { clearHistory, compareChecks, deleteCheck, loadHistory, type HistoryEntry } from "@/lib/history";
import { shareUrl } from "@/lib/share";

const LAB_ROWS: { label: string; get: (p: UserProfileInput) => string | null }[] = [
  { label: "eGFR", get: (p) => (p.labs?.egfr !== undefined ? `${p.labs.egfr}` : null) },
  {
    label: "Creatinine (µmol/L)",
    get: (p) => (p.labs?.creatinineUmolL !== undefined ? `${p.labs.creatinineUmolL}` : null),
  },
  {
    label: "Vitamin D (nmol/L)",
    get: (p) =>
      p.labs?.vitaminDNmolL !== undefined
        ? `${p.labs.vitaminDNmolL} (${fromSi("vitaminDNmolL", p.labs.vitaminDNmolL, "conv")} ng/mL)`
        : null,
  },
  { label: "Ferritin (µg/L)", get: (p) => (p.labs?.ferritinUgL !== undefined ? `${p.labs.ferritinUgL}` : null) },
  { label: "B12 (pmol/L)", get: (p) => (p.labs?.b12PmolL !== undefined ? `${p.labs.b12PmolL}` : null) },
  { label: "HbA1c (%)", get: (p) => (p.labs?.hba1cPercent !== undefined ? `${p.labs.hba1cPercent}` : null) },
  { label: "weight", get: (p) => `${p.weightKg}` },
];

export function HistoryView() {
  const { m: msg, labels, tag } = useI18n();
  const m = msg.history;
  const date = (iso: string) => new Date(iso).toLocaleDateString(tag, { day: "numeric", month: "short", year: "numeric" });
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  useEffect(() => setEntries(loadHistory()), []);

  if (entries === null) return null;
  if (entries.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <h1 className="text-2xl font-bold">{m.title}</h1>
        <p className="text-slate-600">{m.empty}</p>
        <Link href="/check" className="btn-primary">{m.startCheck}</Link>
      </div>
    );
  }

  const [latest, previous] = entries;
  const changes = latest && previous ? compareChecks(latest, previous, m) : [];
  const labRows = LAB_ROWS.map((row) => ({ ...row, values: entries.map((e) => row.get(e.profile)) })).filter((r) =>
    r.values.some((v) => v !== null),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{m.title}</h1>
          <p className="text-sm text-slate-600">{m.savedOnly}</p>
        </div>
        <Link href="/check" className="btn-primary">{m.newCheck}</Link>
      </div>

      {previous && (
        <section className="card">
          <h2 className="font-semibold">{m.since(date(previous.savedAt))}</h2>
          {changes.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{changes.map((c) => <li key={c}>{c}</li>)}</ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600">{m.noChange}</p>
          )}
        </section>
      )}

      {entries.length > 1 && labRows.length > 0 && (
        <section className="card overflow-x-auto">
          <h2 className="mb-2 font-semibold">{m.numbersOverTime}</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-slate-500">
                <th className="py-1 pr-3 font-medium" />
                {entries.map((e) => <th key={e.id} className="py-1 pr-3 font-medium whitespace-nowrap">{date(e.savedAt)}</th>)}
              </tr>
            </thead>
            <tbody>
              {labRows.map((r) => (
                <tr key={r.label} className="border-t border-slate-100">
                  <td className="py-1.5 pr-3 whitespace-nowrap text-slate-600">{r.label === "weight" ? m.weight : r.label}</td>
                  {r.values.map((v, i) => <td key={i} className="py-1.5 pr-3">{v ?? "—"}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <ul className="space-y-3">
        {entries.map((e) => {
          const on = e.items.filter((i) => i.status === "recommended");
          const blocked = e.items.filter((i) => i.status === "blocked");
          return (
            <li key={e.id} className="card space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{date(e.savedAt)}</p>
                <p className="text-xs text-slate-500">{labels.goals[e.profile.goal]} · {e.profile.weightKg} kg</p>
              </div>
              <p className="text-sm">
                {on.length ? on.map((i) => `${i.name} (${i.dose})`).join(" · ") : m.noneRecommended}
              </p>
              {blocked.length > 0 && (
                <p className="text-sm text-red-700">{m.seeDoctorFirst(blocked.map((i) => i.name).join(", "))}</p>
              )}
              <div className="flex gap-2">
                <a href={shareUrl(window.location.origin, e.profile, { mine: true })} className="btn-ghost px-3 py-1.5 text-xs">{m.open}</a>
                <button
                  type="button"
                  className="btn-ghost px-3 py-1.5 text-xs"
                  onClick={() => {
                    deleteCheck(e.id);
                    setEntries(loadHistory());
                  }}
                >
                  {m.delete}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="text-sm text-slate-500 underline"
        onClick={() => {
          if (window.confirm(m.confirmDeleteAll)) {
            clearHistory();
            setEntries([]);
          }
        }}
      >
        {m.deleteAll}
      </button>
    </div>
  );
}
