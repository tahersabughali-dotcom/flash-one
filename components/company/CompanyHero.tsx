import { companyHeroCopy } from "@/data/company-hero";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { CompanyHeroVisual } from "@/components/company/CompanyHeroVisual";

export function CompanyHero() {
  return (
    <section className="relative flex flex-col overflow-hidden pt-24 pb-10 sm:pt-28 sm:pb-12 lg:pt-32 lg:pb-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_36%,rgb(11_125_255/0.11),transparent_32%),radial-gradient(circle_at_16%_72%,rgb(1_208_252/0.09),transparent_28%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-page-soft to-transparent"
        aria-hidden="true"
      />

      <Container className="relative z-10 flex flex-col">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-16">
          <div className="max-w-xl xl:max-w-[36rem]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
              {companyHeroCopy.eyebrow}
            </p>
            <h1 className="mt-3 text-[2.35rem] leading-[0.94] font-extrabold tracking-[-0.045em] text-navy-deep sm:text-[3.15rem] lg:text-[3.4rem] xl:text-[3.65rem]">
              <span className="block">{companyHeroCopy.title[0]}</span>
              <span className="block">
                {companyHeroCopy.title[1]}{" "}
                <span className="bg-linear-to-r from-blue to-cyan bg-clip-text text-transparent">
                  {companyHeroCopy.title[2]}
                </span>
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base lg:mt-6">
              {companyHeroCopy.description}
            </p>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
              {companyHeroCopy.secondary}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-8">
              <Button href={companyHeroCopy.primaryHref} arrow>
                {companyHeroCopy.primaryCta}
              </Button>
              <Button href={companyHeroCopy.secondaryHref} variant="secondary" arrow>
                {companyHeroCopy.secondaryCta}
              </Button>
            </div>

            <div className="mt-6 max-w-sm border-l border-cyan/35 pl-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/45">
                {companyHeroCopy.noteEyebrow}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                {companyHeroCopy.note}
              </p>
            </div>
          </div>

          <div className="md:hidden" aria-hidden="true">
            <CompanyHeroVisual compact />
          </div>
          <div className="mx-auto hidden w-full md:block" aria-hidden="true">
            <CompanyHeroVisual />
          </div>
        </div>

        <ul className="mt-10 inline-flex max-w-full flex-wrap items-center gap-x-5 gap-y-2 rounded-(--radius-card) border border-white/60 bg-white/40 px-5 py-2.5 text-[13px] font-semibold tracking-tight text-navy/80 shadow-(--shadow-glass) backdrop-blur-md sm:mt-12 sm:gap-x-6 sm:px-6 sm:py-3 sm:text-sm lg:rounded-full">
          {companyHeroCopy.strip.map((item, index) => (
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
