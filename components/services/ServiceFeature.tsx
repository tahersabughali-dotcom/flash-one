import { Button } from "@/components/ui/Button";
import { ServiceFeatureVisual } from "@/components/services/ServiceFeatureVisual";
import type { catalogueServices } from "@/data/services-catalogue";

type ServiceFeatureProps = {
  service: (typeof catalogueServices)[number];
};

export function ServiceFeature({ service }: ServiceFeatureProps) {
  return (
    <article
      id={service.id}
      className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16"
    >
      <div className={service.reversed ? "lg:order-2" : undefined}>
        <p className="text-xs font-semibold tracking-[0.18em] text-blue/70">
          {service.number}
        </p>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/45">
          {service.label}
        </p>
        <h3 className="mt-2.5 text-[1.85rem] leading-[0.98] font-extrabold tracking-[-0.035em] text-navy-deep sm:text-[2.25rem] xl:text-[2.55rem]">
          <span className="block">{service.title[0]}</span>
          <span className="block bg-linear-to-r from-blue to-cyan bg-clip-text text-transparent">
            {service.title[1]}
          </span>
        </h3>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
          {service.description}
        </p>
        <ul className="mt-5 flex max-w-lg flex-wrap gap-2">
          {service.capabilities.map((item) => (
            <li
              key={item}
              className="rounded-full border border-line bg-white/65 px-3 py-1.5 text-[12px] font-medium tracking-tight text-navy/70"
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Button href={`#${service.id}`} variant="secondary" arrow>
            {service.cta}
          </Button>
        </div>
      </div>

      <div className={service.reversed ? "lg:order-1" : undefined}>
        <ServiceFeatureVisual type={service.visual} />
      </div>
    </article>
  );
}
