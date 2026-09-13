import { customerPaths, customerPathsCopy } from "@/data/customer-paths";
import { Container } from "@/components/layout/Container";
import { CustomerPath } from "@/components/services/CustomerPath";
import { CustomerPathsVisual } from "@/components/services/CustomerPathsVisual";

export function CustomerPaths() {
  const [idea, built, business, support] = customerPaths;

  return (
    <section id="customer-paths" className="relative overflow-hidden bg-page pt-14 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgb(11_125_255/0.08),transparent_42%)]" />

      <Container className="relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {customerPathsCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2.1rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.75rem] lg:text-[3.15rem]">
            <span className="block">{customerPathsCopy.title[0]}</span>
            <span className="block">{customerPathsCopy.title[1]}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {customerPathsCopy.description}
          </p>
        </div>

        <div className="mt-12 grid gap-12 sm:mt-16 md:grid-cols-2 md:gap-x-10 md:gap-y-14 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)_minmax(0,1fr)] lg:grid-rows-2 lg:items-center lg:gap-x-10 lg:gap-y-16 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)_minmax(0,1fr)]">
          <CustomerPath path={idea} className="lg:col-start-1 lg:row-start-1" />
          <CustomerPath path={built} className="lg:col-start-3 lg:row-start-1" />
          <div className="hidden lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block">
            <CustomerPathsVisual />
          </div>
          <CustomerPath path={business} className="lg:col-start-1 lg:row-start-2" />
          <CustomerPath path={support} className="lg:col-start-3 lg:row-start-2" />
        </div>
      </Container>
    </section>
  );
}
