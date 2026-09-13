import { SolveVisual } from "@/components/solutions/SolveVisual";
import type { solveStages } from "@/data/how-we-solve";

type SolveStageProps = {
  stage: (typeof solveStages)[number];
  isLast?: boolean;
  className?: string;
};

export function SolveStage({
  stage,
  isLast = false,
  className = "",
}: SolveStageProps) {
  const featured = stage.zone === "center";
  const end = stage.zone === "left";

  return (
    <li
      className={[
        "relative grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-5",
        featured
          ? "md:flex md:flex-col md:items-center md:gap-5 md:px-4 md:py-5 md:text-center lg:py-6"
          : "lg:grid-cols-1 lg:gap-4",
        end ? "lg:text-right" : "",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "relative z-10 flex justify-center",
          featured ? "md:static" : end ? "lg:justify-end" : "lg:justify-start",
        ].join(" ")}
      >
        <SolveVisual type={stage.icon} featured={featured} />
        {isLast ? null : (
          <span
            className="absolute top-full bottom-[-1.25rem] left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-blue/28 to-cyan/20 md:hidden"
            aria-hidden="true"
          />
        )}
      </div>

      <div className={["min-w-0 pt-0.5", featured ? "md:pt-0" : ""].join(" ")}>
        <p className="text-xs font-semibold tracking-[0.18em] text-blue/70">
          {stage.number}
          <span className="ml-2 tracking-[0.16em] text-navy/35">{stage.name}</span>
        </p>
        <h3
          className={[
            "mt-1.5 font-extrabold tracking-[-0.035em] text-navy-deep",
            featured
              ? "text-[1.55rem] leading-[1.02] sm:text-[1.8rem]"
              : "text-[1.35rem] leading-[1.05] sm:text-[1.5rem]",
          ].join(" ")}
        >
          <span className="block">{stage.title[0]}</span>
          <span className="block bg-linear-to-r from-blue to-cyan bg-clip-text text-transparent">
            {stage.title[1]}
          </span>
        </h3>
        <p
          className={[
            "mt-2 text-[15px] leading-relaxed text-muted",
            featured ? "mx-auto max-w-sm" : "max-w-md lg:max-w-none",
            end ? "lg:ml-auto" : "",
          ].join(" ")}
        >
          {stage.description}
        </p>
        <p className="mt-2.5 text-[12px] font-semibold tracking-[0.16em] text-navy/45 uppercase">
          {stage.label}
        </p>
      </div>
    </li>
  );
}
