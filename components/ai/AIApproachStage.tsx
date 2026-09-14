import type { aiApproachStages } from "@/data/ai-approach";

type AIApproachStageProps = {
  stage: (typeof aiApproachStages)[number];
  className?: string;
};

export function AIApproachStage({ stage, className = "" }: AIApproachStageProps) {
  const need = stage.zone === "need";
  const lens = stage.zone === "lens";

  return (
    <li className={["min-w-0", className].join(" ")}>
      <p className="text-xs font-semibold tracking-[0.18em] text-blue/70">
        {stage.number}
        <span className="ml-2 tracking-[0.14em] text-navy/35">{stage.name}</span>
      </p>
      <h3
        className={[
          "mt-1.5 font-extrabold tracking-[-0.035em] text-navy-deep",
          need || lens
            ? "text-[1.28rem] leading-[1.06] sm:text-[1.42rem]"
            : "text-[1.2rem] leading-[1.08] sm:text-[1.34rem]",
        ].join(" ")}
      >
        <span className="block">{stage.title[0]}</span>
        <span className="block text-blue">{stage.title[1]}</span>
      </h3>
      <p className="mt-1.5 max-w-sm text-[14px] leading-relaxed text-muted">
        {stage.description}
      </p>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/45">
        {stage.label}
      </p>
    </li>
  );
}
