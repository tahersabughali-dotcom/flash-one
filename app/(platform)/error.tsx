"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">Error</p>
      <h1 className="mt-3 text-3xl font-extrabold text-navy-deep">Something went wrong</h1>
      <p className="mt-4 text-[15px] text-muted">
        Flash One could not complete that request. Try again, or return to a previous page.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </main>
  );
}
