import { PrincipleMark } from "@/components/solutions/SolutionPrinciplesVisual";
import type { solutionPrinciples } from "@/data/solution-principles";

type SolutionPrincipleProps = {
  principle: (typeof solutionPrinciples)[number];
  className?: string;
};

export function SolutionPrinciple({
  principle,
  className = "",
}: SolutionPrincipleProps) {
  const end = principle.corner === "start";

  return (
    <li
      className={[
        "relative min-w-0",
        end ? "lg:text-right" : "",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "mb-3 inline-flex size-11 items-center justify-center rounded-2xl border border-cyan/20 bg-white/80 text-blue shadow-(--shadow-glass)",
          end ? "lg:ml-auto" : "",
        ].join(" ")}
      >
        <PrincipleMark type={principle.icon} />
      </div>
      <p className="text-xs font-semibold tracking-[0.18em] text-blue/70">
        {principle.number}
        <span className="ml-2 tracking-[0.16em] text-navy/35">{principle.name}</span>
      </p>
      <h3 className="mt-1.5 text-[1.4rem] leading-[1.04] font-extrabold tracking-[-0.035em] text-navy-deep sm:text-[1.6rem]">
        <span className="block">{principle.title[0]}</span>
        <span className="block bg-linear-to-r from-blue to-cyan bg-clip-text text-transparent">
          {principle.title[1]}
        </span>
      </h3>
      <p
        className={[
          "mt-2 max-w-sm text-[15px] leading-relaxed text-muted",
          end ? "lg:ml-auto" : "",
        ].join(" ")}
      >
        {principle.description}
      </p>
      <p className="mt-2.5 text-[12px] font-semibold tracking-[0.16em] text-navy/45 uppercase">
        {principle.label}
      </p>
    </li>
  );
}
