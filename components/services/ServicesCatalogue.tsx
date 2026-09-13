import { catalogueServices, servicesCatalogueCopy } from "@/data/services-catalogue";
import { Container } from "@/components/layout/Container";
import { ServiceFeature } from "@/components/services/ServiceFeature";

export function ServicesCatalogue() {
  return (
    <section id="catalogue" className="relative bg-page-soft pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
      <Container>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {servicesCatalogueCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2.1rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.75rem] lg:text-[3.15rem]">
            <span className="block">{servicesCatalogueCopy.title[0]}</span>
            <span className="block">{servicesCatalogueCopy.title[1]}</span>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {servicesCatalogueCopy.description}
          </p>
        </div>

        <div className="mt-12 space-y-16 sm:mt-16 sm:space-y-20 lg:mt-20 lg:space-y-24">
          {catalogueServices.map((service) => (
            <ServiceFeature key={service.id} service={service} />
          ))}
        </div>
      </Container>
    </section>
  );
}
