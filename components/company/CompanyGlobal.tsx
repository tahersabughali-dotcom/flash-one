import {
  companyGlobalCopy,
  companyGlobalConcepts,
} from "@/data/company-global";
import { Container } from "@/components/layout/Container";
import { CompanyGlobalVisual } from "@/components/company/CompanyGlobalVisual";

export function CompanyGlobal() {
  return (
    <section
      id="global-perspective"
      className="relative overflow-hidden bg-page pt-16 pb-16 lg:pt-20 lg:pb-20"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-page-soft to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-page-soft to-transparent"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="max-w-2xl xl:max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {companyGlobalCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2.1rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.65rem] lg:text-[3rem]">
            <span className="block">{companyGlobalCopy.title[0]}</span>
            <span className="mt-1 block">{companyGlobalCopy.title[1]}</span>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {companyGlobalCopy.description}
          </p>
        </div>

        <div className="mt-10 md:mt-12" aria-hidden="true">
          <div className="md:hidden">
            <CompanyGlobalVisual compact />
          </div>
          <div className="hidden md:block">
            <CompanyGlobalVisual />
          </div>
        </div>

        <ul className="mt-10 grid gap-8 md:mt-12 md:grid-cols-3 md:gap-10">
          {companyGlobalConcepts.map((concept) => (
            <li key={concept.name} className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/45">
                {concept.name}
              </p>
              <h3 className="mt-2 text-[1.22rem] leading-[1.08] font-extrabold tracking-[-0.035em] text-navy-deep sm:text-[1.34rem]">
                <span className="block">{concept.title[0]}</span>
                <span className="block text-blue">{concept.title[1]}</span>
              </h3>
              <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-muted">
                {concept.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
