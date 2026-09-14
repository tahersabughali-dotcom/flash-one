import { aiApproachCopy, aiApproachStages } from "@/data/ai-approach";
import { Container } from "@/components/layout/Container";
import { AIApproachStage } from "@/components/ai/AIApproachStage";
import { AIApproachLens } from "@/components/ai/AIApproachVisual";

export function AIApproach() {
  const [understand, discover, shape, build, evolve] = aiApproachStages;

  return (
    <section
      id="ai-approach"
      className="relative overflow-hidden bg-page pt-12 pb-12 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-page-soft to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-page-soft to-transparent"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {aiApproachCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2.05rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.55rem] lg:text-[2.95rem]">
            <span className="block">{aiApproachCopy.title[0]}</span>
            <span className="block">{aiApproachCopy.title[1]}</span>
          </h2>
          <p className="mx-auto mt-3.5 max-w-xl text-[15px] leading-relaxed text-muted">
            {aiApproachCopy.description}
          </p>
        </div>

        <div className="relative mx-auto mt-8 max-w-6xl sm:mt-10 lg:mt-12">
          <div className="mb-5 hidden items-center justify-between px-1 xl:flex">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/40">
              {aiApproachCopy.need}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/40">
              {aiApproachCopy.solution}
            </p>
          </div>

          <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/40 md:hidden">
            {aiApproachCopy.need}
          </p>

          <div className="relative grid gap-8 md:grid-cols-2 md:gap-x-8 md:gap-y-8 xl:grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)_minmax(0,1fr)] xl:items-center xl:gap-x-8 xl:gap-y-7">
            <ol className="contents">
              <AIApproachStage
                stage={understand}
                className="order-1 md:order-none md:col-start-1 md:row-start-1 xl:col-start-1 xl:row-start-1"
              />
              <AIApproachStage
                stage={discover}
                className="order-2 md:order-none md:col-start-2 md:row-start-1 xl:col-start-1 xl:row-start-2"
              />
              <AIApproachStage
                stage={shape}
                className="order-4 md:order-none md:col-span-2 md:row-start-3 md:mx-auto md:max-w-xl xl:col-span-1 xl:col-start-2 xl:row-start-2 xl:max-w-none xl:text-center"
              />
              <AIApproachStage
                stage={build}
                className="order-5 md:order-none md:col-start-1 md:row-start-4 xl:col-start-3 xl:row-start-1"
              />
              <AIApproachStage
                stage={evolve}
                className="order-6 md:order-none md:col-start-2 md:row-start-4 xl:col-start-3 xl:row-start-2"
              />
            </ol>
            <div
              className="order-3 md:hidden"
              aria-hidden="true"
            >
              <AIApproachLens compact />
            </div>
            <div
              className="hidden xl:flex xl:col-start-2 xl:row-start-1 xl:justify-center"
              aria-hidden="true"
            >
              <AIApproachLens />
            </div>
            <div
              className="hidden md:col-span-2 md:row-start-2 md:block xl:hidden"
              aria-hidden="true"
            >
              <AIApproachLens compact />
            </div>
          </div>

          <p className="mt-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/40 md:hidden">
            {aiApproachCopy.solution}
          </p>
        </div>
      </Container>
    </section>
  );
}
