"use client";

import { useFormAction } from "@/components/useFormAction";
import { login } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useFormAction(login, {});
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={action} className="card w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-brand-700">Sukat backoffice sign in</h1>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="username" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
        </div>
        {state.error && <p className="text-sm text-red-700" role="alert">{state.error}</p>}
        <button className="btn-primary w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
