import type { companyDirectionItems } from "@/data/company-direction";

type CompanyDirectionItemProps = {
  item: (typeof companyDirectionItems)[number];
  emphasis?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
};

export function CompanyDirectionItem({
  item,
  emphasis = false,
  align = "left",
  className = "",
}: CompanyDirectionItemProps) {
  const alignClass =
    align === "right"
      ? "xl:ml-auto xl:text-right"
      : align === "center"
        ? "md:mx-auto md:text-center"
        : "";

  return (
    <div className={["relative min-w-0", alignClass, className].join(" ")}>
      {emphasis ? (
        <div
          className="pointer-events-none absolute -inset-x-6 -inset-y-5 rounded-[2rem] bg-[radial-gradient(circle_at_50%_42%,rgb(255_255_255/0.92),rgb(231_242_252/0.22)_54%,transparent_76%)] sm:-inset-x-8 sm:-inset-y-6"
          aria-hidden="true"
        />
      ) : null}
      <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/45">
        {item.label}
      </p>
      <h3
        className={[
          "relative font-extrabold tracking-[-0.035em] text-navy-deep",
          emphasis
            ? "mt-2 text-[1.7rem] leading-[1.02] sm:text-[1.95rem] lg:text-[2.15rem]"
            : "mt-1.5 text-[1.22rem] leading-[1.08] sm:text-[1.34rem]",
        ].join(" ")}
      >
        <span className="block">{item.title[0]}</span>
        <span className="block text-blue">{item.title[1]}</span>
      </h3>
      <p
        className={[
          "relative mt-2.5 leading-relaxed text-muted",
          emphasis ? "max-w-md text-[15px] md:mx-auto" : "max-w-sm text-[14px]",
          align === "right" ? "xl:ml-auto" : "",
        ].join(" ")}
      >
        {item.description}
      </p>
      <p className="relative mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/45">
        {item.micro}
      </p>
    </div>
  );
}
