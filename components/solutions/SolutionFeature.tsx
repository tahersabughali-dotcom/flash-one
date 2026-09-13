import { Button } from "@/components/ui/Button";
import { SolutionVisual } from "@/components/solutions/SolutionVisual";
import type { coreSolutions } from "@/data/core-solutions";

type SolutionFeatureProps = {
  solution: (typeof coreSolutions)[number];
};

export function SolutionFeature({ solution }: SolutionFeatureProps) {
  return (
    <article
      id={solution.id}
      className={[
        "relative flex flex-col overflow-hidden rounded-(--radius-panel) border border-white/70 bg-white/58 p-6 shadow-(--shadow-glass) backdrop-blur-md sm:p-7",
        solution.emphasis
          ? "lg:grid lg:grid-cols-[minmax(13rem,0.9fr)_minmax(0,1.15fr)] lg:items-center lg:gap-8"
          : "",
      ].join(" ")}
    >
      <div className="order-1 min-w-0">
        <p className="text-xs font-semibold tracking-[0.18em] text-blue/70">
          {solution.number}
        </p>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/45">
          {solution.label}
        </p>
        <h3 className="mt-2.5 text-[1.55rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-navy-deep sm:text-[1.8rem]">
          <span className="block">{solution.title[0]}</span>
          <span className="block bg-linear-to-r from-blue to-cyan bg-clip-text text-transparent">
            {solution.title[1]}
          </span>
        </h3>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
          {solution.description}
        </p>
        <ul className="mt-4 flex max-w-lg flex-wrap gap-2">
          {solution.outcomes.map((item) => (
            <li
              key={item}
              className="rounded-full border border-line bg-white/70 px-2.5 py-1 text-[11px] font-medium tracking-tight text-navy/65"
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-5">
          <Button href={`#${solution.id}`} variant="secondary" arrow>
            {solution.cta}
          </Button>
        </div>
      </div>

      <div
        className={[
          "order-2 mt-6",
          solution.emphasis
            ? "lg:order-first lg:mt-0"
            : "mx-auto w-full max-w-[20rem] lg:order-first lg:mt-0 lg:mb-5",
        ].join(" ")}
      >
        <SolutionVisual type={solution.visual} />
      </div>
    </article>
  );
}
