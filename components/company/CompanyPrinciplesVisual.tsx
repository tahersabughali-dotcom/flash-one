import { companyPrinciplesCopy } from "@/data/company-principles";

export function CompanyPrinciplesVisual() {
  return (
    <div
      className="relative mx-auto flex w-full max-w-[16rem] flex-col items-center py-2"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.95),rgb(1_208_252/0.12)_52%,transparent_74%)]" />
      <div className="relative rounded-[1.6rem] border border-white/80 bg-white/55 px-6 py-5 text-center shadow-(--shadow-glass) backdrop-blur-md">
        <ul className="space-y-1">
          {companyPrinciplesCopy.field.map((word) => (
            <li
              key={word}
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/50"
            >
              {word}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
