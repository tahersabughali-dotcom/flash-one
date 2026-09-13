import { services, servicesIntro } from "@/data/services";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { ServiceCard } from "@/components/home/ServiceCard";

export function HomeServices() {
  return (
    <section id="services" className="relative bg-page-soft pt-8 pb-16 sm:pt-10 sm:pb-20 lg:pt-12 lg:pb-24">
      <Container>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
              {servicesIntro.eyebrow}
            </p>
            <h2 className="mt-2 text-[2rem] leading-[0.95] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.75rem] lg:text-[3.15rem]">
              {servicesIntro.title}
            </h2>
            <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-muted">
              {servicesIntro.description}
            </p>
          </div>
          <Button href="#services" variant="secondary" arrow>
            {servicesIntro.action}
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </Container>
    </section>
  );
}
