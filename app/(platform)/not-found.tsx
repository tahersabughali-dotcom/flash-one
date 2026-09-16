import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">Not found</p>
      <h1 className="mt-3 text-3xl font-extrabold text-navy-deep">Page not found</h1>
      <p className="mt-4 text-[15px] text-muted">
        That record or page is not available, or you do not have access to it.
      </p>
      <Link
        href="/app"
        className="mt-8 inline-flex rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white"
      >
        Go to workspace
      </Link>
    </main>
  );
}
