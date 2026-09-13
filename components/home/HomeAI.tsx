import { aiCopy } from "@/data/ai";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { AIVisual } from "@/components/home/AIVisual";
import { AIWorkspace } from "@/components/home/AIWorkspace";

export function HomeAI() {
  return (
    <section id="ai" className="relative bg-page pt-6 pb-14 sm:pt-8 sm:pb-16 lg:pb-20">
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-2 xl:grid-cols-[17rem_minmax(0,1fr)_minmax(22rem,28rem)] xl:gap-8">
          <div className="max-w-md md:col-span-1 lg:max-w-none">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
              {aiCopy.eyebrow}
            </p>
            <h2 className="mt-3 text-[2.2rem] leading-[0.92] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-5xl">
              <span className="block">{aiCopy.title[0]}</span>
              <span className="block">{aiCopy.title[1]}</span>
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
              {aiCopy.description}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href="#ai" arrow>
                {aiCopy.primaryCta}
              </Button>
              <Button href="#ai" variant="secondary" arrow>
                {aiCopy.secondaryCta}
              </Button>
            </div>
            <ul className="mt-8 space-y-2.5 text-sm font-semibold text-navy/75">
              {aiCopy.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="size-1.5 rounded-full bg-blue" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 md:order-3 xl:order-none xl:col-span-1">
            <AIWorkspace />
          </div>

          <div className="md:justify-self-end lg:justify-self-stretch">
            <AIVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}
