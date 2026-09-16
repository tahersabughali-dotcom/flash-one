import { statusTone, type StatusTone } from "@/modules/shared/status";

const TONE_CLASS: Record<StatusTone, string> = {
  neutral: "border-line bg-white text-navy/70",
  info: "border-blue/20 bg-blue/8 text-blue",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-800",
};

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight ${TONE_CLASS[statusTone(status)]}`}
    >
      {label}
    </span>
  );
}
