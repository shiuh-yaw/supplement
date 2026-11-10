"use client";

import { useEffect, useRef, useState } from "react";
import type { ConvertibleLab, LabUnit } from "@supplement/engine";

export interface ExtractResult {
  values: Record<string, string>;
  units: Partial<Record<ConvertibleLab, LabUnit>>;
  found: string[];
  skipped: string[];
  reportDate: string | null;
}

/** "Upload your lab report" — reads the numbers with AI so the user only has to check them. */
export function LabUpload({ onExtract }: { onExtract: (result: ExtractResult) => void }) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ExtractResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/extract-labs")
      .then((r) => r.json())
      .then((d: { enabled?: boolean }) => setEnabled(Boolean(d.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  if (!enabled) return null;

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    setSummary(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/extract-labs", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      const result = data as ExtractResult;
      if (result.found.length === 0) {
        setError("We couldn't find any of the tests we use in this report. You can still type numbers in below.");
      } else {
        onExtract(result);
        setSummary(result);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-dashed border-brand-500 bg-brand-50 p-4 text-sm">
      <p className="font-semibold text-brand-700">Have your report? Upload it and we&apos;ll fill these in.</p>
      <p className="mt-1 text-xs text-slate-600">
        PDF or a clear photo, up to 10 MB. It&apos;s read by Anthropic, our AI provider, only to find the numbers. We don&apos;t keep
        a copy. You&apos;ll check every number before anything is calculated.
      </p>
      <label className={`btn-primary mt-3 cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
        {busy ? "Reading your report…" : "Upload lab report"}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
      {summary && (
        <div className="mt-3 space-y-1 text-sm" role="status">
          <p className="text-brand-700">
            ✓ Filled in {summary.found.join(", ")}
            {summary.reportDate ? ` from your report dated ${summary.reportDate}` : ""}.{" "}
            <strong>Please check each highlighted number against your report.</strong>
          </p>
          {summary.skipped.length > 0 && (
            <p className="text-amber-800">
              Not filled (unit not recognised — please type it in): {summary.skipped.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
