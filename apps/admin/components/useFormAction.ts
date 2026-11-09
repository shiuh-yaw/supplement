"use client";

import { useActionState, startTransition, type FormEvent } from "react";

/**
 * Like useActionState, but submits via onSubmit so React 19 does NOT reset the
 * form afterwards — users keep their edits when validation fails.
 */
export function useFormAction<S>(action: (state: Awaited<S>, formData: FormData) => S | Promise<S>, initial: Awaited<S>) {
  const [state, dispatch, pending] = useActionState<S, FormData>(action, initial);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const formData = new FormData(e.currentTarget, submitter);
    startTransition(() => dispatch(formData));
  };
  return [state, onSubmit, pending] as const;
}
