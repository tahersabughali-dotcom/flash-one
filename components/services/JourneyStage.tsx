import { JourneyVisual } from "@/components/services/JourneyVisual";
import type { journeyStages } from "@/data/service-journey";

type JourneyStageProps = {
  stage: (typeof journeyStages)[number];
  isLast?: boolean;
};

export function JourneyStage({ stage, isLast = false }: JourneyStageProps) {
  const right = stage.side === "right";

  return (
    <li className="relative grid grid-cols-[3.75rem_minmax(0,1fr)] items-start gap-4 py-4.5 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-5 sm:py-5 lg:grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)] lg:items-center lg:gap-8 lg:py-5">
      <div className="relative z-10 flex justify-center lg:col-start-2 lg:row-start-1">
        <JourneyVisual type={stage.icon} isEndpoint={isLast} />
        {isLast ? null : (
          <span
            className="absolute top-full bottom-[-1.25rem] left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-blue/30 to-cyan/25 lg:hidden"
            aria-hidden="true"
          />
        )}
      </div>

      <div
        className={[
          "min-w-0 pt-1 lg:row-start-1 lg:max-w-sm lg:pt-0",
          right ? "lg:col-start-3" : "lg:col-start-1 lg:ml-auto lg:text-right",
        ].join(" ")}
      >
        <p className="text-xs font-semibold tracking-[0.18em] text-blue/70">
          {stage.number}
        </p>
        <h3 className="mt-1.5 text-xl font-extrabold tracking-[-0.03em] text-navy-deep sm:text-[1.45rem]">
          {stage.title}
        </h3>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted lg:max-w-none">
          {stage.description}
        </p>
        <p className="mt-2.5 text-[12px] font-semibold tracking-[0.16em] text-navy/45 uppercase">
          {stage.label}
        </p>
      </div>
    </li>
  );
}
