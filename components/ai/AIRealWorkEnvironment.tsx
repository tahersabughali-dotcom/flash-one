import { AIRealWorkMark } from "@/components/ai/AIRealWorkVisual";
import type { aiRealWorkEnvironments } from "@/data/ai-real-work";

type AIRealWorkEnvironmentProps = {
  environment: (typeof aiRealWorkEnvironments)[number];
  className?: string;
};

export function AIRealWorkEnvironment({
  environment,
  className = "",
}: AIRealWorkEnvironmentProps) {
  const entry = environment.prominence === "entry";
  const embed = environment.prominence === "embed";
  const compact = environment.prominence === "compact";
  const dockRight = environment.side === "left";

  return (
    <li className={["min-w-0", className].join(" ")}>
      <div
        className={[
          "min-w-0",
          dockRight
            ? "xl:border-r xl:border-cyan/20 xl:pr-6"
            : "xl:border-l xl:border-cyan/20 xl:pl-6",
        ].join(" ")}
      >
        <div
          className={[
            "mb-3",
            entry ? "max-w-[11.5rem]" : embed ? "max-w-[11rem]" : "max-w-[9.75rem]",
          ].join(" ")}
          aria-hidden="true"
        >
          <AIRealWorkMark type={environment.icon} />
        </div>
        <p className="text-xs font-semibold tracking-[0.18em] text-blue/70">
          {environment.number}
          <span className="ml-2 tracking-[0.14em] text-navy/35">
            {environment.name}
          </span>
        </p>
        <h3
          className={[
            "mt-2 font-extrabold tracking-[-0.035em] text-navy-deep",
            entry || embed
              ? "text-[1.4rem] leading-[1.04] sm:text-[1.62rem]"
              : compact
                ? "text-[1.25rem] leading-[1.06] sm:text-[1.4rem]"
                : "text-[1.3rem] leading-[1.05] sm:text-[1.48rem]",
          ].join(" ")}
        >
          <span className="block">{environment.title[0]}</span>
          <span className="block text-blue">{environment.title[1]}</span>
        </h3>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">
          {environment.description}
        </p>
        <ul className="mt-3 flex max-w-lg flex-wrap gap-2">
          {environment.examples.map((item) => (
            <li
              key={item}
              className="rounded-full border border-line bg-white/75 px-2.5 py-1 text-[11px] font-medium tracking-tight text-navy/65"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[13px] leading-relaxed text-navy/50">
          {environment.outcome}
        </p>
      </div>
    </li>
  );
}
