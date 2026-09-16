import Link from "next/link";

export function SummaryCard({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: number | string;
}) {
  return (
    <Link
      href={href}
      className="rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
    >
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-navy-deep">{value}</p>
    </Link>
  );
}
