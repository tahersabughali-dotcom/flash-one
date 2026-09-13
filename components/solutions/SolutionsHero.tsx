import { solutionsHeroCopy } from "@/data/solutions-hero";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { SolutionsHeroVisual } from "@/components/solutions/SolutionsHeroVisual";

export function SolutionsHero() {
  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden pt-24 pb-10 sm:pt-28 sm:pb-12 lg:min-h-[52rem] lg:pt-32 lg:pb-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgb(11_125_255/0.11),transparent_34%),radial-gradient(circle_at_16%_28%,rgb(1_208_252/0.09),transparent_30%)]" />

      <Container className="relative z-10 flex flex-1 flex-col">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 xl:gap-12">
          <div className="max-w-xl xl:max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
              {solutionsHeroCopy.eyebrow}
            </p>
            <h1 className="mt-3 text-[2.35rem] leading-[0.94] font-extrabold tracking-[-0.045em] text-navy-deep sm:text-[3.15rem] lg:text-[3.45rem] xl:text-[3.85rem]">
              <span className="block">{solutionsHeroCopy.title[0]}</span>
              <span className="block bg-linear-to-r from-blue to-cyan bg-clip-text text-transparent">
                {solutionsHeroCopy.title[1]}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base lg:mt-6">
              {solutionsHeroCopy.description}
            </p>

            <div className="mt-5 max-w-sm border-l border-cyan/35 pl-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/45">
                {solutionsHeroCopy.noteEyebrow}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                {solutionsHeroCopy.note}
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-8">
              <Button href="#themes" arrow>
                {solutionsHeroCopy.primaryCta}
              </Button>
              <Button href="/#start-a-project" variant="secondary" arrow>
                {solutionsHeroCopy.secondaryCta}
              </Button>
            </div>
          </div>

          <SolutionsHeroVisual />
        </div>

        <ul
          id="themes"
          className="mt-10 inline-flex max-w-full flex-wrap items-center gap-x-5 gap-y-2 rounded-(--radius-card) border border-white/60 bg-white/40 px-5 py-2.5 text-[13px] font-semibold tracking-tight text-navy/80 shadow-(--shadow-glass) backdrop-blur-md sm:mt-12 sm:gap-x-6 sm:px-6 sm:py-3 sm:text-sm lg:mt-auto lg:rounded-full"
        >
          {solutionsHeroCopy.themes.map((item, index) => (
            <li key={item} className="flex items-center gap-5 sm:gap-6">
              {index > 0 ? (
                <span
                  className="hidden h-3.5 w-px bg-navy/15 sm:block"
                  aria-hidden="true"
                />
              ) : null}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
