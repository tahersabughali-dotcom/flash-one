import type { JourneyIcon } from "@/data/service-journey";

export function JourneyVisual({
  type,
  isEndpoint = false,
}: {
  type: JourneyIcon;
  isEndpoint?: boolean;
}) {
  return (
    <span
      className={[
        "relative z-10 flex size-[3.75rem] items-center justify-center rounded-full border bg-white text-blue shadow-(--shadow-glass) sm:size-16",
        isEndpoint ? "border-cyan/35" : "border-cyan/20",
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none absolute inset-0 rounded-full",
          isEndpoint
            ? "bg-[radial-gradient(circle_at_50%_40%,rgb(1_208_252/0.28),transparent_72%)]"
            : "bg-[radial-gradient(circle_at_50%_40%,rgb(1_208_252/0.14),transparent_68%)]",
        ].join(" ")}
        aria-hidden="true"
      />
      {isEndpoint ? (
        <span
          className="pointer-events-none absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgb(1_208_252/0.2),transparent_68%)]"
          aria-hidden="true"
        />
      ) : null}
      <JourneyIconMark type={type} />
    </span>
  );
}

function JourneyIconMark({ type }: { type: JourneyIcon }) {
  const className = "size-6";

  if (type === "understand") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="7.2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.4" fill="currentColor" />
      </svg>
    );
  }

  if (type === "define") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <circle cx="7" cy="12" r="2.1" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17" cy="8" r="2.1" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17" cy="16" r="2.1" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 12h5.6M16.1 9.6 12.2 12l3.9 2.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "design") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <rect x="5" y="6" width="14" height="12" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 9.5h8M8 12.5h5.5M8 15.5h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "build") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <rect x="4.5" y="8" width="6.5" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13" y="5.5" width="6.5" height="13" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M11 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "deliver") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
          d="M6 15.5 12 5.5 18 15.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8.5 15.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 9.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M16.5 8.2A5.6 5.6 0 0 0 8 9.8M7.5 15.8A5.6 5.6 0 0 0 16 14.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M16.5 5.8v3.2h-3.2M7.5 18.2v-3.2h3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
