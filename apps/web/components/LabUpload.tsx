"use client";

import { useEffect, useRef, useState } from "react";
import type { ConvertibleLab, LabUnit } from "@supplement/engine";
import { useI18n } from "@/lib/i18n/context";

export interface ExtractResult {
  values: Record<string, string>;
  units: Partial<Record<ConvertibleLab, LabUnit>>;
  found: string[];
  skipped: string[];
  reportDate: string | null;
}

/** "Upload your lab report" — reads the numbers with AI so the user only has to check them. */
export function LabUpload({ onExtract }: { onExtract: (result: ExtractResult) => void }) {
  const m = useI18n().m.upload;
  const testName = (en: string) => {
    const key = Object.keys(m.tests).find((k) => en === k || en.startsWith(`${k} (`));
    return key ? en.replace(key, m.tests[key]!) : en;
  };
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
      if (!res.ok) throw new Error((data.code && m.errors[data.code as keyof typeof m.errors]) || data.error || m.errors.failed);
      const result = data as ExtractResult;
      if (result.found.length === 0) {
        setError(m.notFound);
      } else {
        onExtract(result);
        setSummary(result);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : m.errors.failed);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-dashed border-brand-500 bg-brand-50 p-4 text-sm">
      <p className="font-semibold text-brand-700">{m.title}</p>
      <p className="mt-1 text-xs text-slate-600">{m.body}</p>
      <label className={`btn-primary mt-3 cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
        {busy ? m.reading : m.button}
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
            {m.filled(summary.found.map(testName).join(", "), summary.reportDate)} <strong>{m.check}</strong>
          </p>
          {summary.skipped.length > 0 && <p className="text-amber-800">{m.skipped(summary.skipped.map(testName).join(", "))}</p>}
        </div>
      )}
    </div>
  );
}
