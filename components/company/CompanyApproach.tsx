import {
  companyApproachCopy,
  companyApproachPrinciples,
} from "@/data/company-approach";
import { Container } from "@/components/layout/Container";
import { CompanyApproachVisual } from "@/components/company/CompanyApproachVisual";

export function CompanyApproach() {
  const [understand, define, build, evolve] = companyApproachPrinciples;

  return (
    <section
      id="company-approach"
      className="relative scroll-mt-28 overflow-hidden bg-page-soft pt-14 pb-14 sm:pt-16 sm:pb-16 lg:pt-16 lg:pb-20"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-page to-transparent"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {companyApproachCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2.05rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.5rem] lg:text-[2.75rem]">
            <span className="block">{companyApproachCopy.title[0]}</span>
            <span className="mt-1 block">{companyApproachCopy.title[1]}</span>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {companyApproachCopy.description}
          </p>
        </div>

        <div className="relative mt-10 md:mt-12">
          <div className="mb-8 md:hidden" aria-hidden="true">
            <CompanyApproachVisual compact />
          </div>

          <div className="relative grid gap-8 md:grid-cols-2 md:gap-x-8 md:gap-y-8 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)_minmax(0,1fr)] xl:items-center xl:gap-x-10">
            <ol className="contents">
              <ApproachPrinciple
                principle={understand}
                className="order-1 md:col-start-1 md:row-start-1 xl:col-start-1 xl:row-start-1"
              />
              <ApproachPrinciple
                principle={define}
                className="order-2 md:col-start-2 md:row-start-1 xl:col-start-3 xl:row-start-1"
              />
              <ApproachPrinciple
                principle={build}
                className="order-3 md:col-start-1 md:row-start-3 xl:col-start-1 xl:row-start-2"
              />
              <ApproachPrinciple
                principle={evolve}
                className="order-4 md:col-start-2 md:row-start-3 xl:col-start-3 xl:row-start-2"
              />
            </ol>

            <div
              className="hidden md:col-span-2 md:row-start-2 md:block xl:hidden"
              aria-hidden="true"
            >
              <CompanyApproachVisual compact />
            </div>
            <div
              className="hidden xl:flex xl:col-start-2 xl:row-span-2 xl:items-center xl:justify-center"
              aria-hidden="true"
            >
              <CompanyApproachVisual />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ApproachPrinciple({
  principle,
  className = "",
}: {
  principle: (typeof companyApproachPrinciples)[number];
  className?: string;
}) {
  return (
    <li className={["min-w-0", className].join(" ")}>
      <p className="text-xs font-semibold tracking-[0.18em] text-blue/70">
        {principle.number}
        <span className="ml-2 tracking-[0.14em] text-navy/35">
          {principle.name}
        </span>
      </p>
      <h3 className="mt-1.5 text-[1.22rem] leading-[1.08] font-extrabold tracking-[-0.035em] text-navy-deep sm:text-[1.34rem]">
        <span className="block">{principle.title[0]}</span>
        <span className="block text-blue">{principle.title[1]}</span>
      </h3>
      <p className="mt-1.5 max-w-sm text-[14px] leading-relaxed text-muted">
        {principle.description}
      </p>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/45">
        {principle.label}
      </p>
    </li>
  );
}
