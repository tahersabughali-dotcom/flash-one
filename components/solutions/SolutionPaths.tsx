import { solutionPaths, solutionPathsCopy } from "@/data/solution-paths";
import { Container } from "@/components/layout/Container";
import { SolutionPath } from "@/components/solutions/SolutionPath";
import { SolutionPathsVisual } from "@/components/solutions/SolutionPathsVisual";

export function SolutionPaths() {
  const [manual, disconnected, outdated, custom] = solutionPaths;

  return (
    <section
      id="solution-paths"
      className="relative overflow-hidden bg-page pt-14 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-page-soft to-transparent"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {solutionPathsCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2.1rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.75rem] lg:text-[3.15rem]">
            <span className="block">{solutionPathsCopy.title[0]}</span>
            <span className="block">{solutionPathsCopy.title[1]}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {solutionPathsCopy.description}
          </p>
        </div>

        <div className="mt-12 grid gap-12 sm:mt-16 md:grid-cols-2 md:gap-x-12 md:gap-y-14 lg:mt-20 lg:gap-x-20">
          <SolutionPath path={manual} />
          <SolutionPath path={disconnected} />
        </div>

        <div className="my-10 hidden lg:block lg:my-14">
          <SolutionPathsVisual />
        </div>

        <div className="mt-12 grid gap-12 md:mt-14 md:grid-cols-2 md:gap-x-12 md:gap-y-14 lg:mt-0 lg:gap-x-20">
          <SolutionPath path={outdated} />
          <SolutionPath path={custom} />
        </div>
      </Container>
    </section>
  );
}
