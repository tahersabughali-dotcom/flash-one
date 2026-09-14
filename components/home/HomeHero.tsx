import { heroCopy } from "@/data/hero";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { HeroValueStrip } from "@/components/home/HeroValueStrip";
import { HeroVisual } from "@/components/home/HeroVisual";

export function HomeHero() {
  return (
    <section className="relative min-h-svh overflow-hidden lg:min-h-[52rem] xl:min-h-[58rem]">
      <HeroVisual />

      <Container className="relative z-10 flex min-h-svh flex-col pb-6 pt-24 sm:pt-28 lg:min-h-[52rem] lg:pb-10 lg:pt-28 xl:min-h-[58rem] xl:pt-32">
        <div className="grid flex-1 grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-6 xl:gap-8">
          <div className="max-w-lg lg:col-span-4 lg:max-w-[22.5rem] lg:pt-6 lg:pr-2 xl:max-w-[24.5rem] xl:pt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/55">
              {heroCopy.eyebrow}
            </p>
            <h1 className="mt-4 text-[2.8rem] leading-[0.9] font-extrabold tracking-[-0.045em] sm:text-6xl lg:text-[4.05rem] xl:text-[5.15rem]">
              <span className="block text-navy-deep">{heroCopy.titleLead}</span>
              <span className="block bg-linear-to-r from-blue to-cyan bg-clip-text text-transparent">
                {heroCopy.titleAccent}
              </span>
            </h1>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-muted lg:mt-6">
              {heroCopy.description}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-8 lg:flex-col lg:items-start xl:flex-row xl:items-center">
              <Button href="/contact#start-conversation" arrow>
                {heroCopy.primaryCta}
              </Button>
              <Button href="/services" variant="secondary" arrow>
                {heroCopy.secondaryCta}
              </Button>
            </div>
          </div>

          <div className="hidden lg:col-span-5 lg:block" />

          <aside className="lg:col-span-3 lg:pt-8 lg:text-right xl:pt-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/45">
              {heroCopy.asideTitle[0]}
            </p>
            <p className="mt-2 text-3xl leading-none font-extrabold tracking-[-0.04em] text-blue sm:text-4xl xl:text-[2.65rem]">
              {heroCopy.asideTitle[1]}
            </p>
            <p className="mt-2 text-3xl leading-none font-extrabold tracking-[-0.04em] text-navy-deep sm:text-4xl xl:text-[2.65rem]">
              {heroCopy.asideTitle[2]}
            </p>
            <ul className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/40 lg:mt-8 lg:flex-col lg:items-end lg:gap-2.5">
              {heroCopy.asideWords.map((word) => (
                <li key={word}>{word}</li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="mt-8 flex flex-col items-start gap-4 sm:mt-10 lg:mt-auto lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <HeroValueStrip />
        </div>
      </Container>
    </section>
  );
}
