import { howWeSolveCopy, solveStages } from "@/data/how-we-solve";
import { Container } from "@/components/layout/Container";
import { SolveStage } from "@/components/solutions/SolveStage";
import { SolveEnvironment } from "@/components/solutions/SolveVisual";

export function HowWeSolve() {
  const [understand, map, design, connect, improve] = solveStages;

  return (
    <section
      id="how-we-solve"
      className="relative overflow-hidden bg-page-soft pt-14 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-page to-transparent"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {howWeSolveCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2.1rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.75rem] lg:text-[3.15rem]">
            <span className="block">{howWeSolveCopy.title[0]}</span>
            <span className="block">{howWeSolveCopy.title[1]}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {howWeSolveCopy.description}
          </p>
        </div>

        <div className="relative mx-auto mt-12 max-w-6xl sm:mt-16 lg:mt-20">
          <div
            className="pointer-events-none absolute inset-x-[8%] top-1/2 hidden h-[28rem] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgb(255_255_255/0.88),transparent_58%)] lg:block"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 lg:block"
            aria-hidden="true"
          >
            <SolveEnvironment />
          </div>

          <ol className="relative grid gap-10 md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)_minmax(0,1fr)] lg:grid-rows-2 lg:items-center lg:gap-x-8 lg:gap-y-14 xl:gap-x-12">
            <SolveStage
              stage={understand}
              className="md:col-start-1 lg:col-start-1 lg:row-start-1"
            />
            <SolveStage
              stage={map}
              className="md:col-start-2 lg:col-start-1 lg:row-start-2"
            />
            <SolveStage
              stage={design}
              className="md:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-span-2"
            />
            <SolveStage
              stage={connect}
              className="md:col-start-1 lg:col-start-3 lg:row-start-1"
            />
            <SolveStage
              stage={improve}
              isLast
              className="md:col-start-2 lg:col-start-3 lg:row-start-2"
            />
          </ol>
        </div>
      </Container>
    </section>
  );
}
