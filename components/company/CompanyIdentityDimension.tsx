import type { companyIdentityDimensions } from "@/data/company-identity";

type CompanyIdentityDimensionProps = {
  dimension: (typeof companyIdentityDimensions)[number];
  className?: string;
};

export function CompanyIdentityDimension({
  dimension,
  className = "",
}: CompanyIdentityDimensionProps) {
  return (
    <li className={["min-w-0", className].join(" ")}>
      <p className="text-xs font-semibold tracking-[0.18em] text-blue/70">
        {dimension.number}
        <span className="ml-2 tracking-[0.14em] text-navy/35">
          {dimension.name}
        </span>
      </p>
      <h3 className="mt-1.5 text-[1.28rem] leading-[1.06] font-extrabold tracking-[-0.035em] text-navy-deep sm:text-[1.42rem]">
        <span className="block">{dimension.title[0]}</span>
        <span className="block text-blue">{dimension.title[1]}</span>
      </h3>
      <p className="mt-1.5 max-w-sm text-[14px] leading-relaxed text-muted">
        {dimension.description}
      </p>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/45">
        {dimension.label}
      </p>
    </li>
  );
}
