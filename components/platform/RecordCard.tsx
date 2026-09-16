import Link from "next/link";
import { StatusBadge } from "./StatusBadge";

export function RecordCard({
  href,
  reference,
  title,
  meta,
  status,
  statusLabel,
}: {
  href: string;
  reference?: string;
  title: string;
  meta?: string;
  status?: string;
  statusLabel?: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        {reference ? (
          <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">{reference}</p>
        ) : (
          <span />
        )}
        {status && statusLabel ? <StatusBadge status={status} label={statusLabel} /> : null}
      </div>
      <p className="mt-2 font-extrabold text-navy-deep">{title}</p>
      {meta ? <p className="mt-2 text-sm text-muted">{meta}</p> : null}
    </Link>
  );
}
