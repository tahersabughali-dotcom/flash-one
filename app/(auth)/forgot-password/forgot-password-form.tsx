"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction, type AuthFormState } from "../actions";

const initialState: AuthFormState = { error: null, message: null };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none"
        />
      </label>

      {state.error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p className="text-sm font-medium text-navy" role="status">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-(--radius-button) bg-blue px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-button) hover:bg-blue-bright disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-sm text-muted">
        <Link href="/login" className="font-semibold text-blue">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
