import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  compact = false,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`${compact ? "" : "mt-8 "}rounded-(--radius-panel) border border-white/70 bg-white/80 p-6 shadow-(--shadow-soft) sm:p-8`}
    >
      <h2 className="text-lg font-extrabold text-navy-deep">{title}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <p className="mt-5">
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-button)"
          >
            {actionLabel}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
