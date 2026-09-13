import { AICapabilityMark } from "@/components/ai/AICapabilitiesVisual";
import type { aiCapabilities } from "@/data/ai-capabilities";

type AICapabilityProps = {
  capability: (typeof aiCapabilities)[number];
  className?: string;
};

export function AICapability({ capability, className = "" }: AICapabilityProps) {
  const entry = capability.zone === "entry";
  const outcome = capability.zone === "outcome";
  const widen = capability.zone === "widen";

  const copy = <CapabilityCopy capability={capability} featured={outcome} />;

  if (outcome) {
    return (
      <li className={["min-w-0", className].join(" ")}>
        <div className="rounded-[1.35rem] border border-white/80 bg-white/60 px-5 py-6 shadow-(--shadow-glass) sm:px-7 sm:py-7 lg:flex lg:items-center lg:gap-12 lg:px-8">
          <div className="mb-4 max-w-[16rem] lg:mb-0 lg:w-[17rem] lg:shrink-0" aria-hidden="true">
            <AICapabilityMark type={capability.icon} />
          </div>
          <div className="min-w-0">{copy}</div>
        </div>
      </li>
    );
  }

  return (
    <li className={["min-w-0", className].join(" ")}>
      <div
        className={[
          "mb-3",
          entry ? "max-w-[12.5rem]" : widen ? "max-w-[10.75rem]" : "max-w-[9.5rem]",
        ].join(" ")}
        aria-hidden="true"
      >
        <AICapabilityMark type={capability.icon} />
      </div>
      {copy}
    </li>
  );
}

function CapabilityCopy({
  capability,
  featured = false,
}: {
  capability: (typeof aiCapabilities)[number];
  featured?: boolean;
}) {
  const entry = capability.zone === "entry";

  return (
    <>
      <p className="text-xs font-semibold tracking-[0.18em] text-blue/70">
        {capability.number}
        <span className="ml-2 tracking-[0.16em] text-navy/35">
          {" "}
          {capability.name}
        </span>
      </p>
      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/45">
        {capability.eyebrow}
      </p>
      <h3
        className={[
          "mt-1.5 font-extrabold tracking-[-0.035em] text-navy-deep",
          featured || entry
            ? "text-[1.45rem] leading-[1.04] sm:text-[1.7rem]"
            : "text-[1.3rem] leading-[1.05] sm:text-[1.5rem]",
        ].join(" ")}
      >
        <span className="block">{capability.title[0]}</span>
        <span className="block bg-linear-to-r from-blue to-cyan bg-clip-text text-transparent">
          {capability.title[1]}
        </span>
      </h3>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">
        {capability.description}
      </p>
      <ul className="mt-3 flex max-w-lg flex-wrap gap-2">
        {capability.examples.map((item) => (
          <li
            key={item}
            className="rounded-full border border-line bg-white/70 px-2.5 py-1 text-[11px] font-medium tracking-tight text-navy/65"
          >
            {item}
          </li>
        ))}
      </ul>
      <p
        className={[
          "mt-3 leading-relaxed",
          featured
            ? "text-[14px] font-medium text-navy/58"
            : "text-[13px] text-navy/50",
        ].join(" ")}
      >
        {capability.outcome}
      </p>
    </>
  );
}
