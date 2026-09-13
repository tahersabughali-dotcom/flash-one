import { servicesHeroCopy } from "@/data/services-hero";

export function ServicesHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-none" aria-hidden="true">
      <div className="absolute inset-[-8%] rounded-full bg-[radial-gradient(circle_at_55%_42%,rgb(11_125_255/0.2),rgb(1_208_252/0.08)_36%,transparent_72%)]" />
      <div className="services-hero-grid absolute inset-3 rounded-[2rem] opacity-50" />

      <svg
        viewBox="0 0 520 420"
        className="relative h-auto w-full"
        fill="none"
      >
        <path
          d="M86 168C148 128 198 118 250 152"
          stroke="rgb(11 125 255 / 0.28)"
          strokeWidth="1.2"
        />
        <path
          d="M250 152C318 192 356 168 412 126"
          stroke="rgb(1 208 252 / 0.32)"
          strokeWidth="1.2"
        />
        <path
          d="M250 152C238 214 214 248 168 292"
          stroke="rgb(11 125 255 / 0.22)"
          strokeWidth="1.2"
        />
        <path
          d="M250 152C292 230 338 268 392 304"
          stroke="rgb(1 208 252 / 0.24)"
          strokeWidth="1.2"
        />
        <circle cx="86" cy="168" r="4" fill="#0b7dff" />
        <circle cx="250" cy="152" r="5" fill="#01d0fc" />
        <circle cx="412" cy="126" r="4" fill="#0b7dff" />
        <circle cx="168" cy="292" r="4" fill="#01d0fc" />
        <circle cx="392" cy="304" r="4" fill="#0b7dff" />
      </svg>

      <div className="pointer-events-none absolute inset-0">
        <ConceptChip
          label={servicesHeroCopy.concepts[0]}
          className="top-[18%] left-[4%] sm:left-[6%]"
        />
        <ConceptChip
          label={servicesHeroCopy.concepts[1]}
          className="top-[8%] right-[6%] sm:right-[10%]"
        />
        <ConceptChip
          label={servicesHeroCopy.concepts[2]}
          className="top-[38%] left-1/2 -translate-x-1/2"
          featured
        />
        <ConceptChip
          label={servicesHeroCopy.concepts[3]}
          className="bottom-[18%] left-[10%] sm:left-[14%]"
        />
        <ConceptChip
          label={servicesHeroCopy.concepts[4]}
          className="right-[4%] bottom-[14%] sm:right-[8%]"
        />
      </div>
    </div>
  );
}

function ConceptChip({
  label,
  className,
  featured = false,
}: {
  label: string;
  className: string;
  featured?: boolean;
}) {
  return (
    <span
      className={[
        "absolute inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3.5 py-2 text-[11px] font-semibold tracking-[0.16em] uppercase shadow-(--shadow-glass) backdrop-blur-md",
        featured
          ? "px-4 py-2.5 text-xs text-navy"
          : "text-navy/70",
        className,
      ].join(" ")}
    >
      <span
        className={[
          "size-1.5 rounded-full",
          featured ? "bg-cyan" : "bg-blue",
        ].join(" ")}
      />
      {label}
    </span>
  );
}
