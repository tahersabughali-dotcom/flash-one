import { Button } from "@/components/ui/Button";
import type { customerPaths } from "@/data/customer-paths";

type CustomerPathProps = {
  path: (typeof customerPaths)[number];
  className?: string;
};

export function CustomerPath({ path, className = "" }: CustomerPathProps) {
  const end = path.align === "end";

  return (
    <article
      id={path.id}
      className={[
        "flex flex-col",
        end ? "lg:items-end lg:text-right" : "lg:items-start",
        className,
      ].join(" ")}
    >
      <p className="text-xs font-semibold tracking-[0.18em] text-blue/70">
        {path.number}
      </p>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/45">
        {path.statement}
      </p>
      <h3 className="mt-2.5 text-[1.65rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-navy-deep sm:text-[1.9rem]">
        <span className="block">{path.title[0]}</span>
        <span className="block bg-linear-to-r from-blue to-cyan bg-clip-text text-transparent">
          {path.title[1]}
        </span>
      </h3>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
        {path.description}
      </p>
      <p
        className={[
          "mt-4 text-[12px] font-medium tracking-tight text-navy/55",
          end ? "lg:text-right" : "",
        ].join(" ")}
      >
        {path.labels.join("  ·  ")}
      </p>
      <div className="mt-5">
        <Button href={`#${path.id}`} variant="secondary" arrow>
          {path.cta}
        </Button>
      </div>
    </article>
  );
}
