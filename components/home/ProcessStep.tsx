import type { ProcessIcon } from "@/data/process";

type ProcessStepProps = {
  number: string;
  title: string;
  description: string;
  icon: ProcessIcon;
  isLast?: boolean;
};

export function ProcessStep({
  number,
  title,
  description,
  icon,
  isLast = false,
}: ProcessStepProps) {
  return (
    <li className="relative flex gap-4 md:block md:text-center">
      <div className="relative z-10 flex shrink-0 flex-col items-center">
        <span className="text-xs font-semibold tracking-[0.16em] text-blue/70">
          {number}
        </span>
        <span className="mt-2 flex size-16 items-center justify-center rounded-full border border-line bg-white text-blue shadow-(--shadow-glass)">
          <ProcessIcon name={icon} />
        </span>
        {isLast ? null : (
          <span
            className="absolute top-[4.75rem] bottom-[-1.25rem] left-1/2 w-px -translate-x-1/2 bg-line md:hidden"
            aria-hidden="true"
          />
        )}
      </div>
      <div className="pt-1 md:mt-4 md:pt-0">
        <h3 className="text-lg font-extrabold tracking-tight text-navy-deep">
          {title}
        </h3>
        <p className="mt-1 max-w-[13rem] text-sm leading-relaxed text-muted md:mx-auto">
          {description}
        </p>
      </div>
    </li>
  );
}

function ProcessIcon({ name }: { name: ProcessIcon }) {
  const className = "size-6";

  if (name === "discover") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
        <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "plan") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 5v1.2M12 17.8V19M5 12h1.2M17.8 12H19M7.1 7.1l.85.85M16.05 16.05l.85.85M7.1 16.9l.85-.85M16.05 7.95l.85-.85"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "build") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
          d="M8 8h8v8H8z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M8 12h8M12 8v8"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    );
  }

  if (name === "deliver") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
          d="M4 12h11M11 7l6 5-6 5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 12.5 10.2 16 17 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
