const STATUS_CLS: Record<string, string> = {
  PUBLISHED: "bg-brand-100 text-brand-700",
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  DRAFT: "bg-slate-100 text-slate-700",
  ARCHIVED: "bg-slate-100 text-slate-400",
};
const EFFECT_CLS: Record<string, string> = {
  RECOMMEND: "bg-brand-50 text-brand-700",
  CAUTION: "bg-amber-50 text-amber-800",
  BLOCK: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_CLS[status] ?? ""}`}>{status.replace("_", " ")}</span>;
}
export function EffectBadge({ effect }: { effect: string }) {
  return <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${EFFECT_CLS[effect] ?? ""}`}>{effect}</span>;
}
