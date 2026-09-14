import Link from "next/link";
import type { services } from "@/data/services";
import { ArrowIcon } from "@/components/ui/icons";
import { ServiceVisual } from "@/components/home/ServiceVisual";

type ServiceCardProps = {
  service: (typeof services)[number];
};

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="grid grid-cols-[minmax(0,1.2fr)_minmax(6.75rem,7.5rem)] items-stretch gap-2 rounded-(--radius-card) border border-white/80 bg-white/85 p-5 shadow-(--shadow-soft) backdrop-blur-md sm:gap-3 sm:p-6">
      <div className="flex min-w-0 flex-col pr-1">
        <p className="text-xs font-semibold tracking-[0.18em] text-blue/70">
          {service.number}
        </p>
        <h3 className="mt-2 text-[1.3rem] leading-[1.12] font-extrabold tracking-[-0.03em] text-balance text-navy-deep sm:text-[1.4rem]">
          {service.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-pretty text-muted">
          {service.description}
        </p>
        <Link
          href={`/services#${service.id}`}
          className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-navy"
        >
          Learn more
          <ArrowIcon className="size-3.5" />
        </Link>
      </div>

      <ServiceVisual type={service.visual} />
    </article>
  );
}
