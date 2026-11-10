"use client";

import { useState } from "react";
import { useFormAction } from "@/components/useFormAction";
import { ALLERGEN_LABELS, COUNTRY_LABELS, CURRENCY_BY_COUNTRY, type Allergen, type Country } from "@supplement/engine";
import { saveProduct } from "@/app/(dash)/products/actions";
import { FormError } from "./FormError";

export interface ProductFormValues {
  id: string;
  supplementId: string;
  brand: string;
  name: string;
  form: string;
  servingSizeG: number;
  activePerServingG: number;
  sugarPerServingG: number;
  servingsPerContainer: number;
  allergens: string[];
  vegan: boolean;
  halalCertified: boolean;
  halalBody: string | null;
  certifications: string[];
  registrationNo: string | null;
  imageUrl: string | null;
  notes: string | null;
  active: boolean;
  prices: { country: string; price: number; url: string | null }[];
}

export function ProductForm({
  product,
  supplements,
  forms,
}: {
  product?: ProductFormValues;
  supplements: { id: string; name: string; unit: string }[];
  forms: readonly string[];
}) {
  const [state, action, pending] = useFormAction(saveProduct, {});
  const [supplementId, setSupplementId] = useState(product?.supplementId ?? supplements[0]?.id ?? "");
  const unit = supplements.find((s) => s.id === supplementId)?.unit ?? "g";
  const priceFor = (c: string) => product?.prices.find((p) => p.country === c);

  return (
    <form onSubmit={action} className="card max-w-3xl space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="supplementId">Supplement</label>
          <select id="supplementId" name="supplementId" className="input" value={supplementId} onChange={(e) => setSupplementId(e.target.value)}>
            {supplements.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="form">Form</label>
          <select id="form" name="form" className="input" defaultValue={product?.form}>
            {forms.map((f) => <option key={f} value={f}>{f.replaceAll("_", " ")}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="brand">Brand</label>
          <input id="brand" name="brand" className="input" defaultValue={product?.brand} />
        </div>
        <div>
          <label className="label" htmlFor="name">Product name</label>
          <input id="name" name="name" className="input" defaultValue={product?.name} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {([
          ["servingSizeG", unit.startsWith("g") ? "Serving size (g)" : "Serving weight (g, 0 if unknown)"],
          ["activePerServingG", `Active amount per serving (${unit})`],
          ["sugarPerServingG", "Sugar per serving (g)"],
          ["servingsPerContainer", "Servings per container"],
        ] as const).map(([key, label]) => (
          <div key={key}>
            <label className="label text-xs" htmlFor={key}>{label}</label>
            <input id={key} name={key} type="number" step="any" className="input" defaultValue={product?.[key]} />
          </div>
        ))}
      </div>

      <fieldset>
        <legend className="label">Allergens</legend>
        <div className="flex flex-wrap gap-3 text-sm">
          {(Object.entries(ALLERGEN_LABELS) as [Allergen, string][]).map(([a, label]) => (
            <label key={a} className="flex items-center gap-1.5">
              <input type="checkbox" name={`allergen_${a}`} defaultChecked={product?.allergens.includes(a)} className="accent-brand-600" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="vegan" defaultChecked={product?.vegan} className="accent-brand-600" /> Vegan
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="halalCertified" defaultChecked={product?.halalCertified} className="accent-brand-600" /> Halal certified
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="accent-brand-600" /> Active (shown to users)
          </label>
        </div>
        <div className="space-y-3">
          <div>
            <label className="label" htmlFor="halalBody">Halal certification body</label>
            <input id="halalBody" name="halalBody" className="input" placeholder="JAKIM, MUI, MUIS…" defaultValue={product?.halalBody ?? ""} />
          </div>
          <div>
            <label className="label" htmlFor="certifications">Third-party testing (comma-separated)</label>
            <input id="certifications" name="certifications" className="input" placeholder="Informed Sport, NSF Certified for Sport" defaultValue={product?.certifications.join(", ")} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="registrationNo">Local registration no. (NPRA / HSA / BPOM…)</label>
          <input id="registrationNo" name="registrationNo" className="input" defaultValue={product?.registrationNo ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="imageUrl">Image URL</label>
          <input id="imageUrl" name="imageUrl" className="input" defaultValue={product?.imageUrl ?? ""} />
        </div>
      </div>

      <fieldset>
        <legend className="label">Prices by country (leave blank if not sold there)</legend>
        <div className="space-y-2">
          {(Object.entries(COUNTRY_LABELS) as [Country, string][]).map(([c, label]) => (
            <div key={c} className="grid grid-cols-[110px_120px_1fr] items-center gap-2 text-sm">
              <span>{label}</span>
              <input name={`price_${c}`} type="number" step="any" className="input" placeholder={CURRENCY_BY_COUNTRY[c]} defaultValue={priceFor(c)?.price} />
              <input name={`url_${c}`} className="input" placeholder="Shopee / Lazada / store link (https://…)" defaultValue={priceFor(c)?.url ?? ""} />
            </div>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="label" htmlFor="notes">Internal notes</label>
        <textarea id="notes" name="notes" rows={2} className="input" defaultValue={product?.notes ?? ""} />
      </div>

      <FormError error={state.error} />
      {state.ok && <p className="text-sm text-brand-700">{state.ok}</p>}
      <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save product"}</button>
    </form>
  );
}
