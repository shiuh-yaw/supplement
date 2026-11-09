"use client";

import { useFormAction } from "@/components/useFormAction";
import { createUser } from "@/app/(dash)/users/actions";
import { FormError } from "./FormError";

export function CreateUserForm() {
  const [state, action, pending] = useFormAction(createUser, {});
  return (
    <form onSubmit={action} className="card space-y-3">
      <h2 className="font-semibold">Add a team member</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" className="input" placeholder="Name" />
        <input name="email" type="email" className="input" placeholder="Email" />
        <select name="role" className="input" defaultValue="EDITOR">
          <option value="EDITOR">Editor — catalog & draft rules</option>
          <option value="REVIEWER">Reviewer — qualified professional, publishes rules</option>
          <option value="ADMIN">Admin — everything</option>
        </select>
        <input name="password" type="password" className="input" placeholder="Temporary password (12+ chars)" autoComplete="new-password" />
      </div>
      <FormError error={state.error} />
      {state.ok && <p className="text-sm text-brand-700">{state.ok}</p>}
      <button className="btn-primary" disabled={pending}>Add user</button>
    </form>
  );
}
