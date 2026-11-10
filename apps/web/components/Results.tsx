"use client";

import { useState } from "react";
import {
  ALLERGEN_LABELS,
  CONDITION_LABELS,
  COUNTRY_LABELS,
  CURRENT_SUPPLEMENT_LABELS,
  DIET_LABELS,
  GOAL_LABELS,
  MEDICATION_LABELS,
  fromSi,
  type Dose,
  type Notice,
  type RankedProduct,
  type RecommendationResult,
  type SupplementRecommendation,
  type UserProfileInput,
} from "@supplement/engine";
import { APP_NAME } from "@/lib/site";
import { marketplaceLabel, shareUrl } from "@/lib/share";
import { saveCheck } from "@/lib/history";
import { buildReminderIcs } from "@/lib/reminders";

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" || currency === "VND" ? 0 : 2,
  }).format(amount);

const servingsText = (n: number) => (n === 0.5 ? "½" : Number.isInteger(n) ? String(n) : `${Math.floor(n)}½`);

const STATUS: Record<SupplementRecommendation["status"], { label: string; cls: string }> = {
  recommended: { label: "Recommended", cls: "bg-brand-100 text-brand-700" },
  not_needed: { label: "Not needed", cls: "bg-slate-100 text-slate-700" },
  not_recommended: { label: "Not for you right now", cls: "bg-slate-100 text-slate-600" },
  blocked: { label: "See a doctor first", cls: "bg-red-100 text-red-700" },
};

function NoticeList({ items, tone }: { items: Notice[]; tone: "red" | "amber" }) {
  if (!items.length) return null;
  const cls = tone === "red" ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-900";
  return (
    <ul className={`space-y-1 rounded-xl border p-3 text-sm ${cls}`}>
      {items.map((n) => (
        <li key={n.ruleId}>⚠ {n.message}</li>
      ))}
    </ul>
  );
}

const SCHEDULE_PHRASE: Record<Dose["schedule"], string> = {
  daily: "a day",
  every_other_day: "every other day",
  per_exercise_hour: "per hour of exercise",
};

function ProductRow({ ranked, rank, dose, ingredient }: { ranked: RankedProduct; rank: number; dose: Dose; ingredient: string }) {
  const { product, price, servingsPerDose } = ranked;
  const servings =
    servingsPerDose.min === servingsPerDose.max
      ? servingsText(servingsPerDose.min)
      : `${servingsText(servingsPerDose.min)}–${servingsText(servingsPerDose.max)}`;
  const one = servingsPerDose.max <= 1;
  // "27 g protein", "1000 IU vitamin D3", "65 mg iron"
  const bareUnit = /^(g|mg|µg|IU)$/.test(dose.unit);
  const active = `${product.activePerServingG.toLocaleString("en")} ${dose.unit}${bareUnit ? ` ${ingredient}` : ""}`;
  return (
    <li className="rounded-xl border border-slate-200 p-4 break-inside-avoid">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-slate-500">#{rank} · {product.brand}</p>
          <p className="font-semibold">{product.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{money(price.price, price.currency)}</p>
          <p className="text-xs text-slate-500">≈ {money(ranked.costPerMonth, price.currency)}/month at your dose</p>
        </div>
      </div>
      <p className="mt-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
        Take <strong>{servings} {one ? "serving" : "servings"} {SCHEDULE_PHRASE[dose.schedule]}</strong>
        <span className="text-slate-600"> · 1 serving has {active}</span>
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {ranked.reasons.map((r) => (
          <li key={r} className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{r}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>Match score {ranked.score}/100</span>
        {price.url && (
          <a href={price.url} target="_blank" rel="noopener noreferrer sponsored" className="btn-ghost px-3 py-1.5 text-xs print:hidden">
            {marketplaceLabel(price.url)} ↗
          </a>
        )}
      </div>
    </li>
  );
}

function SupplementCard({ item }: { item: SupplementRecommendation }) {
  const status = STATUS[item.status];
  const top = item.products.slice(0, 3);
  return (
    <article className="card space-y-4 break-inside-avoid print:shadow-none">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">
          {item.supplement.name}
          {item.alreadyTaking && <span className="ml-2 align-middle text-xs font-medium text-slate-500">· you take this now</span>}
        </h3>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600" title="Strength of scientific evidence">
            Evidence {item.supplement.evidenceGrade}
          </span>
          <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${status.cls}`}>{status.label}</span>
        </div>
      </header>

      <NoticeList items={item.blocks} tone="red" />

      {item.dose && (
        <div className="rounded-xl bg-brand-50 p-4">
          <p className="text-sm text-brand-700">Suggested amount</p>
          <p className="text-2xl font-bold text-brand-700">{item.dose.text}</p>
          <p className="mt-1 text-sm text-slate-600">{item.supplement.timing}</p>
        </div>
      )}

      <NoticeList items={item.cautions} tone="amber" />

      {item.reasons.length > 0 && (
        <div>
          <p className="text-sm font-medium">Why</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {item.reasons.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      )}

      {item.status === "recommended" && item.supplement.notes.length > 0 && (
        <ul className="space-y-1 text-sm text-slate-600">
          {item.supplement.notes.map((n) => <li key={n}>ℹ {n}</li>)}
        </ul>
      )}

      {item.status === "recommended" && (
        <div>
          <p className="mb-2 text-sm font-medium">Products that fit you</p>
          {top.length > 0 ? (
            <>
              <ol className="space-y-2">
                {top.map((p, i) => (
                  <ProductRow key={p.product.id} ranked={p} rank={i + 1} dose={item.dose!} ingredient={item.supplement.name.toLowerCase()} />
                ))}
              </ol>
              {top.some((p) => p.price.url) && (
                <p className="mt-2 text-xs text-slate-500 print:hidden">
                  Shop links may earn us a small commission at no cost to you. It never changes the ranking.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">{item.productsNote}</p>
          )}
        </div>
      )}

      {item.supplement.references.length > 0 && (
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer">Research</summary>
          <ul className="mt-1 space-y-1">
            {item.supplement.references.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline">{r.title}</a>
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}

/** Printed at the top of "Save PDF for my doctor": what the person told us. */
function AnswersSummary({ profile }: { profile: RecommendationResult["profile"] }) {
  const p = profile;
  const list = (items: string[]) => (items.length ? items.join(", ") : "None reported");
  const labs: string[] = [];
  if (p.labs.egfr !== undefined) labs.push(`eGFR ${p.labs.egfr} mL/min/1.73m²`);
  if (p.labs.creatinineUmolL !== undefined)
    labs.push(`Creatinine ${p.labs.creatinineUmolL} µmol/L (${fromSi("creatinineUmolL", p.labs.creatinineUmolL, "conv")} mg/dL)`);
  if (p.labs.altUL !== undefined) labs.push(`ALT ${p.labs.altUL} U/L`);
  if (p.labs.uricAcidUmolL !== undefined)
    labs.push(`Uric acid ${p.labs.uricAcidUmolL} µmol/L (${fromSi("uricAcidUmolL", p.labs.uricAcidUmolL, "conv")} mg/dL)`);
  if (p.labs.hba1cPercent !== undefined) labs.push(`HbA1c ${p.labs.hba1cPercent}%`);
  if (p.labs.vitaminDNmolL !== undefined)
    labs.push(`Vitamin D ${p.labs.vitaminDNmolL} nmol/L (${fromSi("vitaminDNmolL", p.labs.vitaminDNmolL, "conv")} ng/mL)`);
  if (p.labs.ferritinUgL !== undefined) labs.push(`Ferritin ${p.labs.ferritinUgL} µg/L`);
  if (p.labs.b12PmolL !== undefined)
    labs.push(`B12 ${p.labs.b12PmolL} pmol/L (${fromSi("b12PmolL", p.labs.b12PmolL, "conv")} pg/mL)`);

  const rows: [string, string][] = [
    ["Age / sex", `${p.age}, ${p.sex}`],
    ["Weight", `${p.weightKg} kg`],
    ["Country", COUNTRY_LABELS[p.country]],
    ["Goal", `${GOAL_LABELS[p.goal]}, ${p.trainingDaysPerWeek} workouts/week`],
    ["Diet", `${DIET_LABELS[p.diet]}${p.dietaryProteinG !== undefined ? `, ~${Math.round(p.dietaryProteinG)} g protein/day from food` : ""}`],
    ["Fish / seafood", p.fishServingsPerWeek === undefined ? "Not answered" : `${p.fishServingsPerWeek}${p.fishServingsPerWeek >= 2 ? "+" : ""} times/week`],
    ["Allergies", list(p.allergies.map((a) => ALLERGEN_LABELS[a]))],
    ["Conditions", list(p.conditions.map((c) => CONDITION_LABELS[c]))],
    ["Medications", list(p.medications.map((m) => MEDICATION_LABELS[m]))],
    ["Supplements taken now", list(p.currentSupplements.map((s) => CURRENT_SUPPLEMENT_LABELS[s]))],
    ["Lab values", labs.length ? labs.join("; ") : "None entered"],
  ];
  return (
    <section className="hidden rounded-xl border border-slate-300 p-4 text-sm print:block">
      <h2 className="mb-2 font-semibold">Answers this plan is based on</h2>
      <dl className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-slate-500">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ShareBar({ result, profile }: { result: RecommendationResult; profile: UserProfileInput }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saved" | "failed">("idle");
  const ics = buildReminderIcs(result);

  function downloadReminders() {
    if (!ics) return;
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${APP_NAME.toLowerCase()}-reminders.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const url = shareUrl(window.location.origin, profile);
  const summary = result.items
    .filter((i) => i.status === "recommended" || i.status === "blocked")
    .map((i) => `• ${i.supplement.name}: ${i.status === "recommended" && i.dose ? i.dose.text : "see a doctor first"}`)
    .join("\n");
  const text = `My ${APP_NAME} supplement plan:\n${summary || "• No supplements needed right now"}\n\nFull plan: ${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: `${APP_NAME} supplement plan`, text, url });
    } catch {
      /* cancelled */
    }
  }

  return (
    <section className="card space-y-3 print:hidden">
      <h2 className="font-semibold">Keep track</h2>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={saved === "saved"}
          onClick={() => setSaved(saveCheck(profile, result) ? "saved" : "failed")}
        >
          {saved === "saved" ? "Saved on this device ✓" : "Save to my history"}
        </button>
        {ics && (
          <button type="button" className="btn-ghost" onClick={downloadReminders}>
            Add daily reminders to my calendar
          </button>
        )}
      </div>
      {saved === "saved" && (
        <p className="text-xs text-slate-500">
          Saved in this browser only. <a href="/history" className="font-medium text-brand-700 underline">See your history</a> to compare checks over time.
        </p>
      )}
      {saved === "failed" && <p className="text-xs text-red-700">This browser doesn&apos;t allow saving (private mode?).</p>}
      <h2 className="pt-2 font-semibold">Share</h2>
      <div className="flex flex-wrap gap-2">
        <a className="btn bg-[#25D366] text-white hover:bg-[#1ebe5b]" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">
          Share on WhatsApp
        </a>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button type="button" className="btn-ghost" onClick={nativeShare}>More apps…</button>
        )}
        <button type="button" className="btn-ghost" onClick={copy}>{copied ? "Link copied ✓" : "Copy link"}</button>
        <button type="button" className="btn-ghost" onClick={() => window.print()}>Save PDF for my doctor</button>
      </div>
      <p className="text-xs text-slate-500">
        The link contains the answers you gave, including any health details, so only share it with people you trust.
        We don&apos;t store it. To save a PDF, choose “Save as PDF” in the print window.
      </p>
    </section>
  );
}

export function Results({
  result,
  profile,
  shared,
  onRestart,
  onEdit,
}: {
  result: RecommendationResult;
  profile: UserProfileInput;
  shared: boolean;
  onRestart: () => void;
  /** Go back to the questions with the answers kept (not available for shared links). */
  onEdit?: () => void;
}) {
  const order = { recommended: 0, blocked: 1, not_needed: 2, not_recommended: 3 } as const;
  const items = [...result.items].sort((a, b) => order[a.status] - order[b.status]);
  // Full cards for anything to act on; a compact list for the rest.
  const needsCard = (i: SupplementRecommendation) =>
    i.status === "recommended" || i.status === "blocked" || i.alreadyTaking || i.cautions.length > 0;
  const cards = items.filter(needsCard);
  const quiet = items.filter((i) => !needsCard(i));
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {shared && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-700 print:hidden">
          <span>Someone shared these results with you. They&apos;re based on <strong>their</strong> answers, not yours.</span>
          <button type="button" className="btn-primary" onClick={onRestart}>Do my own check</button>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{shared ? "Shared supplement plan" : "Your supplement plan"}</h1>
          <p className="text-sm text-slate-600">
            Goal: {GOAL_LABELS[result.profile.goal]} · {result.profile.weightKg} kg · {result.profile.trainingDaysPerWeek} workouts/week
          </p>
          <p className="hidden text-xs text-slate-500 print:block">Prepared with {APP_NAME} on {today}</p>
        </div>
        {!shared && (
          <div className="flex gap-2 print:hidden">
            {onEdit && <button type="button" className="btn-ghost" onClick={onEdit}>Edit my answers</button>}
            <button type="button" className="btn-ghost" onClick={onRestart}>Start over</button>
          </div>
        )}
      </div>

      <AnswersSummary profile={result.profile} />

      <NoticeList items={result.generalBlocks} tone="red" />
      <NoticeList items={result.generalCautions} tone="amber" />

      {cards.length === 0 && (
        <div className="card text-sm text-slate-600">
          Good news: based on your answers, you don&apos;t need any of the supplements we cover right now.
        </div>
      )}
      {cards.map((item) => <SupplementCard key={item.supplement.slug} item={item} />)}

      {quiet.length > 0 && (
        <section className="card break-inside-avoid">
          <h2 className="font-semibold">Not needed for you right now</h2>
          <ul className="mt-2 divide-y divide-slate-100 text-sm">
            {quiet.map((i) => (
              <li key={i.supplement.slug} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2">
                <span className="font-medium">{i.supplement.name}</span>
                <span className="text-slate-500">{i.reasons.at(-1)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!shared && <ShareBar result={result} profile={profile} />}

      <p className="rounded-xl bg-slate-100 p-4 text-xs text-slate-600">{result.disclaimer}</p>
    </div>
  );
}
