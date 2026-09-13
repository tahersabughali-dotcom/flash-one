import { aiRealWorkCopy, aiRealWorkEnvironments } from "@/data/ai-real-work";
import { Container } from "@/components/layout/Container";
import { AIRealWorkEnvironment } from "@/components/ai/AIRealWorkEnvironment";
import {
  AIRealWorkField,
  AIRealWorkWorkspace,
} from "@/components/ai/AIRealWorkVisual";

export function AIRealWork() {
  const [documents, support, operations, data, workflows, platforms] =
    aiRealWorkEnvironments;

  return (
    <section
      id="real-work"
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
            {aiRealWorkCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2.1rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.75rem] lg:text-[3.15rem]">
            <span className="block">{aiRealWorkCopy.title[0]}</span>
            <span className="block">{aiRealWorkCopy.title[1]}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {aiRealWorkCopy.description}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl md:hidden">
          <AIRealWorkWorkspace compact railId="real-work-rail-mobile" />
        </div>

        <div className="relative mx-auto mt-12 max-w-6xl sm:mt-16 lg:mt-20">
          <div
            className="pointer-events-none absolute inset-x-[8%] inset-y-[6%] hidden xl:block"
            aria-hidden="true"
          >
            <AIRealWorkField />
          </div>

          <div className="relative grid gap-10 md:grid-cols-2 md:gap-x-8 md:gap-y-10 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)_minmax(0,1fr)] xl:items-start xl:gap-x-8 xl:gap-y-12">
            <ol className="contents">
              <AIRealWorkEnvironment
                environment={documents}
                className="md:col-start-1 md:row-start-1 xl:col-start-1 xl:row-start-1"
              />
              <AIRealWorkEnvironment
                environment={support}
                className="md:col-start-2 md:row-start-1 xl:col-start-3 xl:row-start-1"
              />
              <AIRealWorkEnvironment
                environment={operations}
                className="md:col-start-1 md:row-start-3 xl:col-start-1 xl:row-start-2 xl:pt-6"
              />
              <AIRealWorkEnvironment
                environment={data}
                className="md:col-start-2 md:row-start-3 xl:col-start-3 xl:row-start-2"
              />
              <AIRealWorkEnvironment
                environment={workflows}
                className="md:col-start-1 md:row-start-4 xl:col-start-1 xl:row-start-3"
              />
              <AIRealWorkEnvironment
                environment={platforms}
                className="md:col-start-2 md:row-start-4 xl:col-start-3 xl:row-start-3 xl:pt-4"
              />
            </ol>
            <div
              className="hidden xl:flex xl:col-start-2 xl:row-span-3 xl:self-stretch xl:items-stretch xl:justify-center"
              aria-hidden="true"
            >
              <AIRealWorkWorkspace />
            </div>
            <div
              className="hidden md:col-span-2 md:row-start-2 md:block xl:hidden"
              aria-hidden="true"
            >
              <AIRealWorkWorkspace compact railId="real-work-rail-tablet" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
