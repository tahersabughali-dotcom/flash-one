import { companyCtaCopy } from "@/data/company-principles";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { CompanyFinalCTAVisual } from "@/components/company/CompanyFinalCTAVisual";

export function CompanyFinalCTA() {
  return (
    <section
      id="company-cta"
      className="relative overflow-hidden bg-page pt-12 pb-12 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-page-soft to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-page-soft to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_48%,rgb(11_125_255/0.1),transparent_34%),radial-gradient(circle_at_18%_72%,rgb(1_208_252/0.08),transparent_28%)]"
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,22rem)] lg:gap-12">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
              {companyCtaCopy.eyebrow}
            </p>
            <h2 className="mt-2.5 text-[2.1rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.75rem] lg:text-[3.05rem]">
              <span className="block">{companyCtaCopy.title[0]}</span>
              <span className="mt-1 block bg-linear-to-r from-blue to-cyan bg-clip-text text-transparent">
                {companyCtaCopy.title[1]}
              </span>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
              {companyCtaCopy.description}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href={companyCtaCopy.primaryHref} arrow>
                {companyCtaCopy.primaryCta}
              </Button>
              <Button
                href={companyCtaCopy.secondaryHref}
                variant="secondary"
                arrow
              >
                {companyCtaCopy.secondaryCta}
              </Button>
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-navy/45">
              {companyCtaCopy.note}
            </p>
          </div>

          <div className="md:hidden" aria-hidden="true">
            <CompanyFinalCTAVisual compact />
          </div>
          <div
            className="mx-auto hidden w-full max-w-[20rem] md:block lg:max-w-none"
            aria-hidden="true"
          >
            <CompanyFinalCTAVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}
