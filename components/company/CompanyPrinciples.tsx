import {
  companyPrinciples,
  companyPrinciplesCopy,
} from "@/data/company-principles";
import { Container } from "@/components/layout/Container";
import { CompanyPrinciplesVisual } from "@/components/company/CompanyPrinciplesVisual";

export function CompanyPrinciples() {
  const [practical, connected, aroundNeed, evolve] = companyPrinciples;

  return (
    <section
      id="why-flash-one"
      className="relative overflow-hidden bg-page-soft pt-12 pb-12 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16"
    >
      <Container className="relative">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {companyPrinciplesCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[1.95rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.35rem] lg:text-[2.55rem]">
            <span className="block">{companyPrinciplesCopy.title[0]}</span>
            <span className="mt-1 block">{companyPrinciplesCopy.title[1]}</span>
          </h2>
          <p className="mt-3.5 max-w-xl text-[15px] leading-relaxed text-muted">
            {companyPrinciplesCopy.description}
          </p>
        </div>

        <div className="mt-8 md:hidden" aria-hidden="true">
          <CompanyPrinciplesVisual />
        </div>

        <div className="relative mt-8 grid gap-7 md:mt-10 md:grid-cols-2 md:gap-x-10 md:gap-y-8 xl:grid-cols-[minmax(0,1fr)_minmax(12rem,16rem)_minmax(0,1fr)] xl:items-center">
          <ol className="contents">
            <PrincipleItem
              item={practical}
              className="order-1 md:col-start-1 md:row-start-1 xl:col-start-1 xl:row-start-1"
            />
            <PrincipleItem
              item={connected}
              className="order-2 md:col-start-2 md:row-start-1 xl:col-start-3 xl:row-start-1"
            />
            <PrincipleItem
              item={aroundNeed}
              className="order-3 md:col-start-1 md:row-start-3 xl:col-start-1 xl:row-start-2"
            />
            <PrincipleItem
              item={evolve}
              className="order-4 md:col-start-2 md:row-start-3 xl:col-start-3 xl:row-start-2"
            />
          </ol>
          <div
            className="hidden md:col-span-2 md:row-start-2 md:flex md:justify-center xl:col-span-1 xl:col-start-2 xl:row-span-2"
            aria-hidden="true"
          >
            <CompanyPrinciplesVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}

function PrincipleItem({
  item,
  className = "",
}: {
  item: (typeof companyPrinciples)[number];
  className?: string;
}) {
  return (
    <li className={["min-w-0", className].join(" ")}>
      <p className="text-xs font-semibold tracking-[0.18em] text-blue/70">
        {item.number}
      </p>
      <h3 className="mt-1 text-[1.18rem] leading-snug font-extrabold tracking-[-0.03em] text-navy-deep">
        {item.title}
      </h3>
      <p className="mt-1.5 max-w-sm text-[14px] leading-relaxed text-muted">
        {item.description}
      </p>
    </li>
  );
}
