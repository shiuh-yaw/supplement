"use client";

import { useState } from "react";
import { applyAffiliate, normaliseHost, validateAffiliateProgram } from "@supplement/engine";
import { useFormAction } from "@/components/useFormAction";
import { saveProgram } from "@/app/(dash)/affiliate/actions";
import { FormError } from "./FormError";

export interface AffiliateValues {
  id?: string;
  name: string;
  host: string;
  template: string;
  enabled: boolean;
}

export function AffiliateForm({ initial, sampleUrl }: { initial?: AffiliateValues; sampleUrl?: string }) {
  const [state, action, pending] = useFormAction(saveProgram, {});
  const [host, setHost] = useState(initial?.host ?? "");
  const [template, setTemplate] = useState(initial?.template ?? "");
  const example = sampleUrl ?? (host ? `https://${normaliseHost(host)}/product/123` : "");
  const problems = host && template ? validateAffiliateProgram({ host, template }) : [];
  const preview =
    example && template && problems.length === 0
      ? applyAffiliate(example, { host, template, enabled: true }, "sukat_protein")
      : null;

  return (
    <form onSubmit={action} className="space-y-3">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Name</span>
          <input name="name" className="input" defaultValue={initial?.name} placeholder="Shopee Malaysia" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Shop hostname</span>
          <input name="host" className="input" value={host} onChange={(e) => setHost(e.target.value)} placeholder="shopee.com.my" />
        </label>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Link template or parameters</span>
        <input
          name="template"
          className="input font-mono text-xs"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          placeholder="https://s.shopee.com.my/an_redir?origin_link={url}&affiliate_id=YOUR_ID&sub_id={sub}"
        />
        <span className="block text-xs text-slate-500">
          Either a link from your affiliate dashboard with <code>{"{url}"}</code> where the product link goes (and optionally{" "}
          <code>{"{sub}"}</code> for a tracking label such as <code>sukat_protein</code>), or parameters to add to the product link,
          e.g. <code>rcode=ABC123</code>.
        </span>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="enabled" defaultChecked={initial?.enabled ?? true} className="accent-brand-600" /> Enabled
      </label>
      {preview && (
        <p className="rounded-lg bg-slate-50 p-2 text-xs break-all text-slate-600">
          <span className="font-medium text-slate-700">Preview:</span> {preview}
        </p>
      )}
      {problems.length > 0 && <FormError error={problems} />}
      <FormError error={state.error} />
      {state.ok && <p className="text-sm text-brand-700">{state.ok}</p>}
      <button className="btn-primary" disabled={pending}>{initial?.id ? "Save" : "Add program"}</button>
    </form>
  );
}
