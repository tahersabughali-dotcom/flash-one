import { aiCapabilities, aiCapabilitiesCopy } from "@/data/ai-capabilities";
import { Container } from "@/components/layout/Container";
import { AICapability } from "@/components/ai/AICapability";
import {
  AICapabilitiesField,
  AICapabilitiesLayer,
} from "@/components/ai/AICapabilitiesVisual";

export function AICapabilities() {
  const [understand, assist, automate, connect, improve] = aiCapabilities;

  return (
    <section
      id="practical-intelligence"
      className="relative overflow-hidden bg-page-soft pt-14 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24"
    >
      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {aiCapabilitiesCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2.1rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.75rem] lg:text-[3.15rem]">
            <span className="block">{aiCapabilitiesCopy.title[0]}</span>
            <span className="block">{aiCapabilitiesCopy.title[1]}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {aiCapabilitiesCopy.description}
          </p>
        </div>

        <div className="relative mx-auto mt-12 max-w-6xl overflow-hidden rounded-(--radius-panel) border border-white/70 bg-white/45 px-5 py-8 shadow-(--shadow-glass) backdrop-blur-md sm:mt-16 sm:px-8 sm:py-10 lg:mt-20 lg:px-10 lg:py-12">
          <div
            className="pointer-events-none absolute inset-x-[6%] inset-y-[12%] hidden lg:block"
            aria-hidden="true"
          >
            <AICapabilitiesField />
          </div>

          <div className="relative grid gap-10 md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8">
            <ol className="contents">
              <AICapability
                capability={understand}
                className="md:col-start-1 md:row-start-1 lg:col-span-6 lg:col-start-1 lg:row-start-1"
              />
              <AICapability
                capability={assist}
                className="md:col-start-2 md:row-start-1 lg:col-span-5 lg:col-start-8 lg:row-start-1"
              />
              <AICapability
                capability={automate}
                className="md:col-start-1 md:row-start-3 lg:col-span-5 lg:col-start-1 lg:row-start-3"
              />
              <AICapability
                capability={connect}
                className="md:col-start-2 md:row-start-3 lg:col-span-5 lg:col-start-8 lg:row-start-3"
              />
              <AICapability
                capability={improve}
                className="md:col-span-2 md:row-start-4 lg:col-span-12 lg:row-start-4"
              />
            </ol>
            <div
              className="hidden md:col-span-2 md:row-start-2 md:flex md:items-center md:justify-center lg:col-span-12"
              aria-hidden="true"
            >
              <AICapabilitiesLayer />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
