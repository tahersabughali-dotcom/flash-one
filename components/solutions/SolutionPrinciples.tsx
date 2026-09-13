import { solutionPrinciples, solutionPrinciplesCopy } from "@/data/solution-principles";
import { Container } from "@/components/layout/Container";
import { SolutionPrinciple } from "@/components/solutions/SolutionPrinciple";
import {
  SolutionPrinciplesCore,
  SolutionPrinciplesField,
} from "@/components/solutions/SolutionPrinciplesVisual";

export function SolutionPrinciples() {
  const [custom, connected, scalable, adaptable] = solutionPrinciples;

  return (
    <section
      id="solution-principles"
      className="relative overflow-hidden bg-page pt-14 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-page-soft to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-page-soft to-transparent"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {solutionPrinciplesCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2.1rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.75rem] lg:text-[3.15rem]">
            <span className="block">{solutionPrinciplesCopy.title[0]}</span>
            <span className="block">{solutionPrinciplesCopy.title[1]}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {solutionPrinciplesCopy.description}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-sm md:hidden" aria-hidden="true">
          <SolutionPrinciplesCore compact />
        </div>

        <div className="relative mx-auto mt-12 max-w-6xl sm:mt-16 lg:mt-20">
          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 lg:block"
            aria-hidden="true"
          >
            <SolutionPrinciplesField />
          </div>

          <div className="relative grid gap-10 md:grid-cols-2 md:items-center md:gap-x-12 md:gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)_minmax(0,1fr)] lg:grid-rows-2 lg:gap-x-10 lg:gap-y-16 xl:gap-x-14">
            <ol className="contents">
              <SolutionPrinciple
                principle={custom}
                className="md:col-start-1 md:row-start-1 lg:col-start-1 lg:row-start-1"
              />
              <SolutionPrinciple
                principle={connected}
                className="md:col-start-2 md:row-start-1 lg:col-start-3 lg:row-start-1"
              />
              <SolutionPrinciple
                principle={scalable}
                className="md:col-start-1 md:row-start-3 lg:col-start-1 lg:row-start-2"
              />
              <SolutionPrinciple
                principle={adaptable}
                className="md:col-start-2 md:row-start-3 lg:col-start-3 lg:row-start-2"
              />
            </ol>
            <div
              className="hidden lg:flex lg:col-start-2 lg:row-span-2 lg:items-center lg:justify-center"
              aria-hidden="true"
            >
              <SolutionPrinciplesCore />
            </div>
            <div
              className="hidden md:col-span-2 md:row-start-2 md:block lg:hidden"
              aria-hidden="true"
            >
              <SolutionPrinciplesCore compact />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
