"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">Admin</p>
      <h1 className="mt-3 text-3xl font-extrabold text-navy-deep">Admin request failed</h1>
      <p className="mt-4 text-[15px] text-muted">
        The admin action could not be completed. Internal details are not shown here.
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
