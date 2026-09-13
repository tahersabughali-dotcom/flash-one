import { Button } from "@/components/ui/Button";
import type { solutionPaths } from "@/data/solution-paths";

type SolutionPathProps = {
  path: (typeof solutionPaths)[number];
};

export function SolutionPath({ path }: SolutionPathProps) {
  return (
    <article id={path.id} className="min-w-0">
      <p className="text-xs font-semibold tracking-[0.18em] text-blue/70">
        {path.number}
      </p>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/45">
        {path.statement}
      </p>
      <h3 className="mt-2.5 text-[1.55rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-navy-deep sm:text-[1.8rem]">
        <span className="block">{path.title[0]}</span>
        <span className="block bg-linear-to-r from-blue to-cyan bg-clip-text text-transparent">
          {path.title[1]}
        </span>
      </h3>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
        {path.description}
      </p>
      <div className="mt-4">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-navy/40 uppercase">
          Best-fit direction
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {path.directions.map((item) => (
            <li
              key={item}
              className="rounded-full border border-line bg-white/55 px-2.5 py-1 text-[11px] font-medium tracking-tight text-navy/65"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5">
        <Button href={path.href} variant="secondary" arrow>
          {path.cta}
        </Button>
      </div>
    </article>
  );
}
