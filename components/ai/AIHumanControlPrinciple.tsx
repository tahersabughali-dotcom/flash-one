import type { aiHumanControlPrinciples } from "@/data/ai-human-control";

type AIHumanControlPrincipleProps = {
  principle: (typeof aiHumanControlPrinciples)[number];
  className?: string;
};

export function AIHumanControlPrinciple({
  principle,
  className = "",
}: AIHumanControlPrincipleProps) {
  const primary = principle.prominence === "primary";
  const safeguard = principle.prominence === "safeguard";

  const copy = (
    <>
      <p className="text-xs font-semibold tracking-[0.18em] text-blue/70">
        {principle.number}
        <span className="ml-2 tracking-[0.14em] text-navy/35">
          {principle.name}
        </span>
      </p>
      <h3
        className={[
          "mt-2 font-extrabold tracking-[-0.035em] text-navy-deep",
          primary
            ? "text-[1.5rem] leading-[1.02] sm:text-[1.8rem]"
            : safeguard
              ? "text-[1.4rem] leading-[1.04] sm:text-[1.65rem]"
              : "text-[1.28rem] leading-[1.06] sm:text-[1.45rem]",
        ].join(" ")}
      >
        <span className="block">{principle.title[0]}</span>
        <span className="block text-blue">{principle.title[1]}</span>
      </h3>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">
        {principle.description}
      </p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/45">
        {principle.label}
      </p>
    </>
  );

  if (safeguard) {
    return (
      <li className={["min-w-0", className].join(" ")}>
        <div className="rounded-[1.35rem] border border-white/80 bg-white/60 px-5 py-6 shadow-(--shadow-glass) sm:px-7 sm:py-7 lg:flex lg:items-center lg:gap-10">
          <div
            className="mb-4 flex h-16 w-full max-w-[11rem] items-center justify-center rounded-2xl border border-cyan/25 bg-white/90 lg:mb-0 lg:h-20 lg:w-[11rem] lg:shrink-0"
            aria-hidden="true"
          >
            <span className="h-px w-8 bg-navy/15" />
            <span className="mx-2 size-2.5 rounded-full border border-cyan/70 bg-white" />
            <span className="h-px w-8 bg-navy/15" />
          </div>
          <div className="min-w-0">{copy}</div>
        </div>
      </li>
    );
  }

  return <li className={["min-w-0", className].join(" ")}>{copy}</li>;
}
