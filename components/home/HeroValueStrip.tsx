import { heroCopy } from "@/data/hero";

export function HeroValueStrip() {
  return (
    <ul className="inline-flex max-w-full flex-wrap items-center gap-x-5 gap-y-2 rounded-full border border-white/60 bg-white/40 px-5 py-2.5 text-[13px] font-semibold tracking-tight text-navy/80 shadow-(--shadow-glass) backdrop-blur-md sm:gap-x-6 sm:px-6 sm:py-3 sm:text-sm">
      {heroCopy.values.map((value, index) => (
        <li key={value} className="flex items-center gap-5 sm:gap-6">
          {index > 0 ? (
            <span
              className="hidden h-3.5 w-px bg-navy/15 sm:block"
              aria-hidden="true"
            />
          ) : null}
          <span>{value}</span>
        </li>
      ))}
    </ul>
  );
}
