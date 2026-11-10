"use client";

import { useState } from "react";
import {
  fromSi,
  groupDigits,
  unitLabel,
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
import { useI18n } from "@/lib/i18n/context";

const money = (amount: number, currency: string, tag: string) =>
  new Intl.NumberFormat(tag, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" || currency === "VND" ? 0 : 2,
  }).format(amount);

const servingsText = (n: number) => (n === 0.5 ? "½" : Number.isInteger(n) ? String(n) : `${Math.floor(n)}½`);

const STATUS_CLS: Record<SupplementRecommendation["status"], string> = {
  recommended: "bg-brand-100 text-brand-700",
  not_needed: "bg-slate-100 text-slate-700",
  not_recommended: "bg-slate-100 text-slate-600",
  blocked: "bg-red-100 text-red-700",
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

function ProductRow({ ranked, rank, dose, ingredient }: { ranked: RankedProduct; rank: number; dose: Dose; ingredient: string }) {
  const { m: msg, locale, tag } = useI18n();
  const m = msg.results;
  const { product, price, servingsPerDose } = ranked;
  const servings =
    servingsPerDose.min === servingsPerDose.max
      ? servingsText(servingsPerDose.min)
      : `${servingsText(servingsPerDose.min)}–${servingsText(servingsPerDose.max)}`;
  const one = servingsPerDose.max <= 1;
  // "27 g protein", "1000 IU vitamin D3", "65 mg iron"
  const bareUnit = /^(g|mg|µg|IU)$/.test(dose.unit);
  const active = `${groupDigits(String(product.activePerServingG), locale)} ${unitLabel(dose.unit, locale)}${bareUnit ? ` ${ingredient}` : ""}`;
  return (
    <li className="rounded-xl border border-slate-200 p-4 break-inside-avoid">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-slate-500">#{rank} · {product.brand}</p>
          <p className="font-semibold">{product.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{money(price.price, price.currency, tag)}</p>
          <p className="text-xs text-slate-500">{m.perMonth(money(ranked.costPerMonth, price.currency, tag))}</p>
        </div>
      </div>
      <p className="mt-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
        {m.take} <strong>{servings} {one ? m.serving : m.servings} {m.schedule[dose.schedule]}</strong>
        <span className="text-slate-600">{m.oneServingHas(active)}</span>
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {ranked.reasons.map((r) => (
          <li key={r} className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{r}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>{m.score(ranked.score)}</span>
        {price.url && (
          <a href={`/go/${encodeURIComponent(product.id)}?c=${price.country}`} target="_blank" rel="noopener sponsored nofollow" className="btn-ghost px-3 py-1.5 text-xs print:hidden">
            {marketplaceLabel(price.url, m)} ↗
          </a>
        )}
      </div>
    </li>
  );
}

function SupplementCard({ item }: { item: SupplementRecommendation }) {
  const m = useI18n().m.results;
  const top = item.products.slice(0, 3);
  return (
    <article className="card space-y-4 break-inside-avoid print:shadow-none">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">
          {item.supplement.name}
          {item.alreadyTaking && <span className="ml-2 align-middle text-xs font-medium text-slate-500">{m.takingNow}</span>}
        </h3>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600" title={m.evidenceTitle}>
            {m.evidence(item.supplement.evidenceGrade)}
          </span>
          <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${STATUS_CLS[item.status]}`}>{m.status[item.status]}</span>
        </div>
      </header>

      <NoticeList items={item.blocks} tone="red" />

      {item.dose && (
        <div className="rounded-xl bg-brand-50 p-4">
          <p className="text-sm text-brand-700">{m.suggested}</p>
          <p className="text-2xl font-bold text-brand-700">{item.dose.text}</p>
          <p className="mt-1 text-sm text-slate-600">{item.supplement.timing}</p>
        </div>
      )}

      <NoticeList items={item.cautions} tone="amber" />

      {item.reasons.length > 0 && (
        <div>
          <p className="text-sm font-medium">{m.why}</p>
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
          <p className="mb-2 text-sm font-medium">{m.productsFit}</p>
          {top.length > 0 ? (
            <>
              <ol className="space-y-2">
                {top.map((p, i) => (
                  <ProductRow key={p.product.id} ranked={p} rank={i + 1} dose={item.dose!} ingredient={item.supplement.name.toLowerCase()} />
                ))}
              </ol>
              {top.some((p) => p.price.url) && (
                <p className="mt-2 text-xs text-slate-500 print:hidden">
                  {m.commission}{" "}
                  <a href="/how-it-works#money" className="underline">{m.howWeChoose}</a>
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
          <summary className="cursor-pointer">{m.research}</summary>
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
  const { m: msg, labels } = useI18n();
  const a = msg.results.answers;
  const p = profile;
  const list = (items: string[]) => (items.length ? items.join(", ") : a.none);
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
    [a.ageSex, `${p.age}, ${p.sex === "male" ? msg.q.male : msg.q.female}`],
    [a.weight, `${p.weightKg} kg`],
    [a.country, labels.countries[p.country]],
    [a.goal, a.workouts(labels.goals[p.goal], p.trainingDaysPerWeek)],
    [a.diet, `${labels.diets[p.diet]}${p.dietaryProteinG !== undefined ? a.fromFood(Math.round(p.dietaryProteinG)) : ""}`],
    [a.fish, p.fishServingsPerWeek === undefined ? a.notAnswered : a.fishTimes(p.fishServingsPerWeek)],
    [a.allergies, list(p.allergies.map((x) => labels.allergens[x]))],
    [a.conditions, list(p.conditions.map((c) => labels.conditions[c]))],
    [a.medications, list(p.medications.map((x) => labels.medications[x]))],
    [a.current, list(p.currentSupplements.map((x) => labels.currentSupplements[x]))],
    [a.labs, labs.length ? labs.join("; ") : a.noLabs],
  ];
  return (
    <section className="hidden rounded-xl border border-slate-300 p-4 text-sm print:block">
      <h2 className="mb-2 font-semibold">{a.title}</h2>
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
  const { m: msg } = useI18n();
  const m = msg.results;
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saved" | "failed">("idle");
  const ics = buildReminderIcs(result, "08:00", new Date(), msg.reminders);

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
    .map((i) => `• ${i.supplement.name}: ${i.status === "recommended" && i.dose ? i.dose.text : m.shareSeeDoctor}`)
    .join("\n");
  const text = m.shareText(APP_NAME, summary || m.shareNone, url);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt(m.copyPrompt, url);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: m.shareTitle(APP_NAME), text, url });
    } catch {
      /* cancelled */
    }
  }

  return (
    <section className="card space-y-3 print:hidden">
      <h2 className="font-semibold">{m.keepTrack}</h2>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={saved === "saved"}
          onClick={() => setSaved(saveCheck(profile, result) ? "saved" : "failed")}
        >
          {saved === "saved" ? m.saved : m.saveHistory}
        </button>
        {ics && (
          <button type="button" className="btn-ghost" onClick={downloadReminders}>
            {m.reminders}
          </button>
        )}
      </div>
      {saved === "saved" && (
        <p className="text-xs text-slate-500">
          {m.savedNote} <a href="/history" className="font-medium text-brand-700 underline">{m.seeHistory}</a> {m.savedNoteEnd}
        </p>
      )}
      {saved === "failed" && <p className="text-xs text-red-700">{m.saveFailed}</p>}
      <h2 className="pt-2 font-semibold">{m.share}</h2>
      <div className="flex flex-wrap gap-2">
        <a className="btn bg-[#25D366] text-white hover:bg-[#1ebe5b]" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">
          {m.whatsapp}
        </a>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button type="button" className="btn-ghost" onClick={nativeShare}>{m.moreApps}</button>
        )}
        <button type="button" className="btn-ghost" onClick={copy}>{copied ? m.copied : m.copy}</button>
        <button type="button" className="btn-ghost" onClick={() => window.print()}>{m.savePdf}</button>
      </div>
      <p className="text-xs text-slate-500">
        {m.linkNote}
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
  const { m: msg, labels, tag } = useI18n();
  const m = msg.results;
  const order = { recommended: 0, blocked: 1, not_needed: 2, not_recommended: 3 } as const;
  const items = [...result.items].sort((a, b) => order[a.status] - order[b.status]);
  // Full cards for anything to act on; a compact list for the rest.
  const needsCard = (i: SupplementRecommendation) =>
    i.status === "recommended" || i.status === "blocked" || i.alreadyTaking || i.cautions.length > 0;
  const cards = items.filter(needsCard);
  const quiet = items.filter((i) => !needsCard(i));
  const today = new Date().toLocaleDateString(tag, { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {shared && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-700 print:hidden">
          <span>{m.sharedBanner}</span>
          <button type="button" className="btn-primary" onClick={onRestart}>{m.doOwn}</button>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{shared ? m.sharedTitle : m.title}</h1>
          <p className="text-sm text-slate-600">
            {m.goalLine(labels.goals[result.profile.goal], result.profile.weightKg, result.profile.trainingDaysPerWeek)}
          </p>
          <p className="hidden text-xs text-slate-500 print:block">{m.preparedOn(APP_NAME, today)}</p>
        </div>
        {!shared && (
          <div className="flex gap-2 print:hidden">
            {onEdit && <button type="button" className="btn-ghost" onClick={onEdit}>{m.editAnswers}</button>}
            <button type="button" className="btn-ghost" onClick={onRestart}>{m.startOver}</button>
          </div>
        )}
      </div>

      <AnswersSummary profile={result.profile} />

      <NoticeList items={result.generalBlocks} tone="red" />
      <NoticeList items={result.generalCautions} tone="amber" />

      {cards.length === 0 && (
        <div className="card text-sm text-slate-600">
          {m.allClear}
        </div>
      )}
      {cards.map((item) => <SupplementCard key={item.supplement.slug} item={item} />)}

      {quiet.length > 0 && (
        <section className="card break-inside-avoid">
          <h2 className="font-semibold">{m.notNeededTitle}</h2>
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
