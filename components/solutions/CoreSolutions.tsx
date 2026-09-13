import { coreSolutions, coreSolutionsCopy } from "@/data/core-solutions";
import { Container } from "@/components/layout/Container";
import { SolutionFeature } from "@/components/solutions/SolutionFeature";

export function CoreSolutions() {
  const [systems, transformation, automation, platforms] = coreSolutions;

  return (
    <section
      id="core-solutions"
      className="relative overflow-hidden bg-page-soft pt-14 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-page to-transparent"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {coreSolutionsCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2.1rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.75rem] lg:text-[3.15rem]">
            <span className="block">{coreSolutionsCopy.title[0]}</span>
            <span className="block">{coreSolutionsCopy.title[1]}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {coreSolutionsCopy.description}
          </p>
        </div>

        <div className="mt-12 space-y-8 sm:mt-16 lg:mt-20 lg:space-y-10">
          <div className="grid items-start gap-8 lg:grid-cols-[1.12fr_0.88fr]">
            <SolutionFeature solution={systems} />
            <SolutionFeature solution={transformation} />
          </div>
          <div className="grid items-start gap-8 lg:grid-cols-[0.88fr_1.12fr]">
            <SolutionFeature solution={automation} />
            <SolutionFeature solution={platforms} />
          </div>
        </div>
      </Container>
    </section>
  );
}
