import {
  companyDirectionCopy,
  companyDirectionItems,
} from "@/data/company-direction";
import { Container } from "@/components/layout/Container";
import { CompanyDirectionItem } from "@/components/company/CompanyDirectionItem";
import { CompanyDirectionVisual } from "@/components/company/CompanyDirectionVisual";

export function CompanyDirection() {
  const [mission, guide, vision] = companyDirectionItems;

  return (
    <section
      id="our-direction"
      className="relative overflow-hidden bg-page pt-14 pb-14 sm:pt-16 sm:pb-16 lg:pt-16 lg:pb-20"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-page-soft to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-page-soft to-transparent"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {companyDirectionCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2.05rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.55rem] lg:text-[2.85rem]">
            <span className="block">{companyDirectionCopy.title[0]}</span>
            <span className="mt-1 block">{companyDirectionCopy.title[1]}</span>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {companyDirectionCopy.description}
          </p>
        </div>

        <div className="relative mt-10 md:mt-12">
          <div
            className="absolute top-1 bottom-1 left-0 md:hidden"
            aria-hidden="true"
          >
            <CompanyDirectionVisual variant="vertical" />
          </div>

          <div className="grid grid-cols-1 gap-10 pl-10 md:gap-10 md:pl-0 xl:grid-cols-3 xl:items-start xl:gap-x-12 xl:gap-y-4">
            <CompanyDirectionItem item={mission} />

            <div className="hidden md:block xl:hidden" aria-hidden="true">
              <CompanyDirectionVisual variant="compact" />
            </div>

            <CompanyDirectionItem
              item={guide}
              emphasis
              align="center"
              className="xl:pt-4"
            />

            <CompanyDirectionItem
              item={vision}
              align="right"
              className="xl:pt-12"
            />

            <div
              className="hidden xl:col-span-3 xl:block xl:pt-2"
              aria-hidden="true"
            >
              <CompanyDirectionVisual />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
