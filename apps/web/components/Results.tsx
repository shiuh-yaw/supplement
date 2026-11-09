"use client";

import type { Notice, RankedProduct, RecommendationResult, SupplementRecommendation } from "@supplement/engine";
import { GOAL_LABELS } from "@supplement/engine";

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" || currency === "VND" ? 0 : 2,
  }).format(amount);

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

function ProductRow({ ranked, rank }: { ranked: RankedProduct; rank: number }) {
  const { product, price } = ranked;
  return (
    <li className="rounded-xl border border-slate-200 p-4">
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
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {ranked.reasons.map((r) => (
          <li key={r} className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{r}</li>
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>Match score {ranked.score}/100</span>
        {price.url && (
          <a href={price.url} target="_blank" rel="noopener noreferrer sponsored" className="font-medium text-brand-700 underline">
            Where to buy
          </a>
        )}
      </div>
    </li>
  );
}

function SupplementCard({ item }: { item: SupplementRecommendation }) {
  const status = STATUS[item.status];
  return (
    <article className="card space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{item.supplement.name}</h3>
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
          {item.products.length > 0 ? (
            <ol className="space-y-2">
              {item.products.slice(0, 3).map((p, i) => <ProductRow key={p.product.id} ranked={p} rank={i + 1} />)}
            </ol>
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

export function Results({ result, onRestart }: { result: RecommendationResult; onRestart: () => void }) {
  const order = { recommended: 0, blocked: 1, not_needed: 2, not_recommended: 3 } as const;
  const items = [...result.items].sort((a, b) => order[a.status] - order[b.status]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Your supplement plan</h1>
          <p className="text-sm text-slate-600">
            Goal: {GOAL_LABELS[result.profile.goal]} · {result.profile.weightKg} kg · {result.profile.trainingDaysPerWeek} workouts/week
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost" onClick={() => window.print()}>Print for my doctor</button>
          <button type="button" className="btn-ghost" onClick={onRestart}>Start over</button>
        </div>
      </div>

      <NoticeList items={result.generalBlocks} tone="red" />
      <NoticeList items={result.generalCautions} tone="amber" />

      {items.map((item) => <SupplementCard key={item.supplement.slug} item={item} />)}

      <p className="rounded-xl bg-slate-100 p-4 text-xs text-slate-600">{result.disclaimer}</p>
    </div>
  );
}
