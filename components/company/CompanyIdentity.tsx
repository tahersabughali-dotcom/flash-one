import {
  companyIdentityCopy,
  companyIdentityDimensions,
} from "@/data/company-identity";
import { Container } from "@/components/layout/Container";
import { CompanyIdentityDimension } from "@/components/company/CompanyIdentityDimension";
import { CompanyIdentityVisual } from "@/components/company/CompanyIdentityVisual";

export function CompanyIdentity() {
  const [ideas, systems, technology, execution] = companyIdentityDimensions;

  return (
    <section
      id="who-we-are"
      className="relative overflow-hidden bg-page-soft pt-12 pb-12 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-20"
    >
      <Container className="relative">
        <div className="xl:grid xl:grid-cols-[minmax(16.5rem,22rem)_minmax(0,1fr)] xl:items-start xl:gap-12">
          <div className="max-w-xl xl:max-w-none xl:pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
              {companyIdentityCopy.eyebrow}
            </p>
            <h2 className="mt-2.5 text-[2.05rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.55rem] lg:text-[2.85rem]">
              <span className="block">{companyIdentityCopy.title[0]}</span>
              <span className="mt-1 block">{companyIdentityCopy.title[1]}</span>
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
              {companyIdentityCopy.description[0]}
            </p>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
              {companyIdentityCopy.description[1]}
            </p>
          </div>

          <div className="relative mt-10 xl:mt-0">
            <div className="mb-8 md:hidden" aria-hidden="true">
              <CompanyIdentityVisual compact />
            </div>

            <div className="relative grid gap-8 md:grid-cols-2 md:gap-x-8 md:gap-y-8 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,21rem)_minmax(0,1fr)] xl:items-center xl:gap-x-8 xl:gap-y-8">
              <ol className="contents">
                <CompanyIdentityDimension
                  dimension={ideas}
                  className="order-1 md:order-none md:col-start-1 md:row-start-1 xl:col-start-1 xl:row-start-1"
                />
                <CompanyIdentityDimension
                  dimension={systems}
                  className="order-2 md:order-none md:col-start-2 md:row-start-1 xl:col-start-1 xl:row-start-2"
                />
                <CompanyIdentityDimension
                  dimension={technology}
                  className="order-3 md:order-none md:col-start-1 md:row-start-3 xl:col-start-3 xl:row-start-1"
                />
                <CompanyIdentityDimension
                  dimension={execution}
                  className="order-4 md:order-none md:col-start-2 md:row-start-3 xl:col-start-3 xl:row-start-2"
                />
              </ol>

              <div
                className="hidden md:col-span-2 md:row-start-2 md:block xl:hidden"
                aria-hidden="true"
              >
                <CompanyIdentityVisual compact />
              </div>
              <div
                className="hidden xl:flex xl:col-start-2 xl:row-span-2 xl:flex-col xl:items-center xl:justify-center"
                aria-hidden="true"
              >
                <CompanyIdentityVisual />
              </div>
            </div>

            <div className="mt-8 max-w-md md:mx-auto md:text-center xl:mt-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/45">
                <span className="block">{companyIdentityCopy.statement[0]}</span>
                <span className="block">{companyIdentityCopy.statement[1]}</span>
                <span className="block">{companyIdentityCopy.statement[2]}</span>
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {companyIdentityCopy.statementSupport}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
