import {
  aiHumanControlCopy,
  aiHumanControlPrinciples,
} from "@/data/ai-human-control";
import { Container } from "@/components/layout/Container";
import { AIHumanControlPrinciple } from "@/components/ai/AIHumanControlPrinciple";
import {
  AIHumanControlCore,
  AIHumanControlField,
} from "@/components/ai/AIHumanControlVisual";

export function AIHumanControl() {
  const [control, responsibility, assistance, boundaries, oversight] =
    aiHumanControlPrinciples;

  return (
    <section
      id="human-control"
      className="relative overflow-hidden bg-page-soft pt-14 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24"
    >
      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {aiHumanControlCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2.1rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.75rem] lg:text-[3.15rem]">
            <span className="block">{aiHumanControlCopy.title[0]}</span>
            <span className="block">{aiHumanControlCopy.title[1]}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {aiHumanControlCopy.description}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl md:hidden">
          <AIHumanControlCore compact />
        </div>

        <div className="relative mx-auto mt-12 max-w-6xl sm:mt-16 lg:mt-20">
          <div
            className="pointer-events-none absolute inset-x-[10%] inset-y-[8%] hidden xl:block"
            aria-hidden="true"
          >
            <AIHumanControlField />
          </div>

          <div className="relative grid gap-10 md:grid-cols-2 md:gap-x-8 md:gap-y-10 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)_minmax(0,1fr)] xl:items-start xl:gap-x-10 xl:gap-y-12">
            <ol className="contents">
              <AIHumanControlPrinciple
                principle={control}
                className="md:col-start-1 md:row-start-1 xl:col-start-1 xl:row-start-1"
              />
              <AIHumanControlPrinciple
                principle={responsibility}
                className="md:col-start-2 md:row-start-1 xl:col-start-1 xl:row-start-2"
              />
              <AIHumanControlPrinciple
                principle={assistance}
                className="md:col-start-1 md:row-start-3 xl:col-start-3 xl:row-start-1"
              />
              <AIHumanControlPrinciple
                principle={boundaries}
                className="md:col-start-2 md:row-start-3 xl:col-start-3 xl:row-start-2"
              />
              <AIHumanControlPrinciple
                principle={oversight}
                className="md:col-span-2 md:row-start-4 xl:col-span-3 xl:row-start-3"
              />
            </ol>
            <div
              className="hidden xl:flex xl:col-start-2 xl:row-span-2 xl:self-center xl:justify-center"
              aria-hidden="true"
            >
              <AIHumanControlCore />
            </div>
            <div
              className="hidden md:col-span-2 md:row-start-2 md:block xl:hidden"
              aria-hidden="true"
            >
              <AIHumanControlCore compact />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
