"use client";

import { useFormAction } from "@/components/useFormAction";
import { transitionRule } from "@/app/(dash)/rules/actions";
import { FormError } from "./FormError";

const ACTIONS: Record<string, { action: string; label: string; cls: string; reviewer: boolean }[]> = {
  DRAFT: [
    { action: "submit", label: "Submit for review", cls: "btn-primary", reviewer: false },
    { action: "archive", label: "Archive", cls: "btn-danger", reviewer: true },
  ],
  PENDING_REVIEW: [
    { action: "publish", label: "Approve & publish", cls: "btn-primary", reviewer: true },
    { action: "reject", label: "Send back to draft", cls: "btn-ghost", reviewer: true },
    { action: "archive", label: "Archive", cls: "btn-danger", reviewer: true },
  ],
  PUBLISHED: [{ action: "archive", label: "Unpublish (archive)", cls: "btn-danger", reviewer: true }],
  ARCHIVED: [{ action: "restore", label: "Restore as draft", cls: "btn-ghost", reviewer: false }],
};

export function ReviewPanel({ id, status, isReviewer }: { id: string; status: string; isReviewer: boolean }) {
  const [state, action, pending] = useFormAction(transitionRule, {});
  const buttons = (ACTIONS[status] ?? []).filter((b) => isReviewer || !b.reviewer);

  return (
    <form onSubmit={action} className="card space-y-3">
      <h2 className="font-semibold">Review</h2>
      <input type="hidden" name="id" value={id} />
      {status === "PENDING_REVIEW" && isReviewer && (
        <textarea name="reviewNote" rows={2} className="input" placeholder="Review note (required when sending back)" />
      )}
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => (
          <button key={b.action} name="action" value={b.action} className={b.cls} disabled={pending}>{b.label}</button>
        ))}
        {buttons.length === 0 && <p className="text-sm text-slate-500">A reviewer needs to act on this rule.</p>}
      </div>
      <FormError error={state.error} />
      {state.ok && <p className="text-sm text-brand-700">{state.ok}</p>}
    </form>
  );
}
