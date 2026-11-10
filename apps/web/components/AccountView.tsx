"use client";

import { useEffect, useState } from "react";
import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { useI18n } from "@/lib/i18n/context";
import { loadHistory, mergeHistory, replaceHistory, type HistoryEntry } from "@/lib/history";

interface Status {
  signedIn: boolean;
  checks: number;
}

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "error");
  return data as T;
}

const isCancel = (e: unknown) => e instanceof Error && (e.name === "NotAllowedError" || e.name === "AbortError");

export function AccountView({ consentVersion }: { consentVersion: string }) {
  const m = useI18n().m.account;
  const [status, setStatus] = useState<Status | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [supported, setSupported] = useState(true);

  async function refresh() {
    const s = (await fetch("/api/account", { cache: "no-store" }).then((r) => r.json())) as Status;
    setStatus(s);
  }

  useEffect(() => {
    setSupported(browserSupportsWebAuthn());
    void refresh();
  }, []);

  async function run(fn: () => Promise<string | void>) {
    setBusy(true);
    setMessage(null);
    try {
      const ok = await fn();
      if (ok) setMessage({ tone: "ok", text: ok });
      await refresh();
    } catch (e) {
      setMessage({ tone: "error", text: isCancel(e) ? m.cancelled : e instanceof Error && e.message !== "error" ? e.message : m.error });
    } finally {
      setBusy(false);
    }
  }

  const sync = () =>
    run(async () => {
      const local = loadHistory();
      const res = await post<{ added: number; entries: HistoryEntry[] }>("/api/account/checks", { entries: local });
      const merged = mergeHistory(local, res.entries);
      replaceHistory(merged);
      return m.synced(res.added, merged.length);
    });

  const create = () =>
    run(async () => {
      const options = await post<Parameters<typeof startRegistration>[0]["optionsJSON"]>("/api/account/register/options", {
        consent: true,
        consentVersion,
      });
      const attestation = await startRegistration({ optionsJSON: options });
      await post("/api/account/register/verify", attestation);
      await syncAfterSignIn();
    });

  const signIn = () =>
    run(async () => {
      const options = await post<Parameters<typeof startAuthentication>[0]["optionsJSON"]>("/api/account/login/options");
      const assertion = await startAuthentication({ optionsJSON: options });
      await post("/api/account/login/verify", assertion);
      await syncAfterSignIn();
    });

  // Bring this device and the account together straight after signing in.
  async function syncAfterSignIn() {
    const local = loadHistory();
    const res = await post<{ added: number; entries: HistoryEntry[] }>("/api/account/checks", { entries: local });
    replaceHistory(mergeHistory(local, res.entries));
  }

  const signOut = () => run(async () => void (await post("/api/account/logout")));

  const remove = () =>
    run(async () => {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) throw new Error("error");
      setConfirming(false);
      return m.deleted;
    });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{m.title}</h1>
        <p className="text-slate-600">{m.lede}</p>
      </header>

      {status === null ? null : status.signedIn ? (
        <section className="card space-y-4">
          <p className="text-sm text-slate-700">
            {m.signedIn} <strong>{status.checks}</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary" disabled={busy} onClick={sync}>{busy ? m.syncing : m.sync}</button>
            <a className="btn-ghost" href="/api/account/export">{m.download}</a>
            <button type="button" className="btn-ghost" disabled={busy} onClick={signOut}>{m.signOut}</button>
          </div>
          <div className="border-t border-slate-200 pt-4">
            {confirming ? (
              <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-3" role="alertdialog" aria-labelledby="delete-q">
                <p id="delete-q" className="text-sm text-red-800">{m.confirm}</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn bg-red-700 text-white hover:bg-red-800" disabled={busy} onClick={remove}>{m.yes}</button>
                  <button type="button" className="btn-ghost" onClick={() => setConfirming(false)}>{m.cancel}</button>
                </div>
              </div>
            ) : (
              <button type="button" className="text-sm text-red-700 underline" onClick={() => setConfirming(true)}>{m.delete}</button>
            )}
          </div>
        </section>
      ) : (
        <section className="card space-y-4">
          <p className="text-sm leading-relaxed text-slate-700">{m.store}</p>
          <p className="text-sm leading-relaxed text-slate-700">{m.rights}</p>
          {!supported && <p className="text-sm text-amber-800">{m.noPasskey}</p>}
          <label className="flex items-start gap-2 text-sm">
            <input id="account-consent" type="checkbox" className="mt-1 accent-brand-600" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>{m.consent}</span>
          </label>
          <button type="button" className="btn-primary" disabled={!consent || busy || !supported} onClick={create}>{m.create}</button>
          <div className="border-t border-slate-200 pt-4 text-sm">
            <p className="text-slate-600">{m.have}</p>
            <button type="button" className="btn-ghost mt-2" disabled={busy || !supported} onClick={signIn}>{m.signIn}</button>
          </div>
        </section>
      )}

      {message && (
        <p className={`text-sm ${message.tone === "ok" ? "text-brand-700" : "text-red-700"}`} role={message.tone === "ok" ? "status" : "alert"}>
          {message.text}
        </p>
      )}
    </div>
  );
}
