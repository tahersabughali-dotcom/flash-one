import type { SolveIcon } from "@/data/how-we-solve";

export function SolveVisual({
  type,
  featured = false,
}: {
  type: SolveIcon;
  featured?: boolean;
}) {
  return (
    <span
      className={[
        "relative z-10 flex items-center justify-center rounded-full border bg-white text-blue shadow-(--shadow-glass)",
        featured
          ? "size-[4.25rem] border-cyan/30 sm:size-[4.75rem]"
          : "size-[3.5rem] border-cyan/18 sm:size-16",
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none absolute inset-0 rounded-full",
          featured
            ? "bg-[radial-gradient(circle_at_50%_38%,rgb(1_208_252/0.22),transparent_70%)]"
            : "bg-[radial-gradient(circle_at_50%_40%,rgb(1_208_252/0.12),transparent_68%)]",
        ].join(" ")}
        aria-hidden="true"
      />
      <SolveIconMark type={type} />
    </span>
  );
}

function SolveIconMark({ type }: { type: SolveIcon }) {
  const className = "size-6";

  if (type === "understand") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
        <circle cx="6.2" cy="7.2" r="1" fill="currentColor" opacity="0.45" />
        <circle cx="18" cy="8.5" r="0.9" fill="currentColor" opacity="0.4" />
      </svg>
    );
  }

  if (type === "map") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <circle cx="7" cy="8" r="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="8.5" cy="16.5" r="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16.5" cy="16" r="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.8 9.2 15.2 8.4M8.6 14.8 7.8 10M15.4 9.4 16 14.1M10.4 16.2h4.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "design") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <rect x="5" y="5.5" width="14" height="13" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 9.2h8M8 12.2h5.5M8 15.2h3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "connect") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <rect x="3.8" y="8" width="6.2" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <rect x="14" y="6.5" width="6.2" height="11" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M16.4 8.1A5.5 5.5 0 0 0 8.1 10M7.6 15.9A5.5 5.5 0 0 0 15.9 14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M16.4 5.6v3.2h-3.2M7.6 18.4v-3.2h3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SolveEnvironment() {
  return (
    <svg
      viewBox="0 0 1100 420"
      className="h-auto w-full"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="128" cy="168" r="54" stroke="rgb(11 125 255 / 0.16)" strokeWidth="1.2" />
      <circle cx="118" cy="214" r="18" fill="rgb(11 125 255 / 0.06)" />
      <circle cx="72" cy="92" r="3.4" fill="#0b7dff" opacity="0.5" />
      <circle cx="46" cy="156" r="2.6" fill="#01d0fc" opacity="0.42" />
      <circle cx="98" cy="138" r="2.2" fill="#0b7dff" opacity="0.38" />
      <circle cx="38" cy="228" r="3" fill="#0b7dff" opacity="0.4" />
      <circle cx="86" cy="262" r="2.4" fill="#01d0fc" opacity="0.38" />
      <circle cx="132" cy="318" r="3.2" fill="#0b7dff" opacity="0.46" />
      <circle cx="168" cy="86" r="2.2" fill="#01d0fc" opacity="0.34" />
      <path
        d="M72 92C92 126 104 148 118 186M46 156C78 172 96 188 118 208M86 262C108 236 114 224 122 206"
        stroke="rgb(11 125 255 / 0.22)"
        strokeWidth="1.15"
      />
      <path
        d="M132 318C210 268 278 232 430 214"
        stroke="rgb(11 125 255 / 0.2)"
        strokeWidth="1.2"
      />
      <path
        d="M168 86C248 132 332 176 430 204"
        stroke="rgb(1 208 252 / 0.22)"
        strokeWidth="1.2"
      />

      <circle cx="550" cy="210" r="118" fill="rgb(255 255 255 / 0.42)" />
      <circle cx="550" cy="210" r="118" stroke="rgb(11 125 255 / 0.1)" strokeWidth="1" />
      <circle cx="550" cy="210" r="86" stroke="rgb(1 208 252 / 0.28)" strokeWidth="1.3" />
      <circle cx="550" cy="210" r="58" stroke="rgb(11 125 255 / 0.2)" strokeWidth="1.15" />
      <rect
        x="486"
        y="146"
        width="128"
        height="128"
        rx="22"
        stroke="rgb(11 125 255 / 0.16)"
        strokeWidth="1.15"
      />

      <path d="M668 210H1028" stroke="rgb(1 208 252 / 0.32)" strokeWidth="1.4" />
      <path
        d="M668 174C760 148 848 128 960 114"
        stroke="rgb(11 125 255 / 0.26)"
        strokeWidth="1.2"
      />
      <path
        d="M668 246C760 272 848 292 960 306"
        stroke="rgb(11 125 255 / 0.24)"
        strokeWidth="1.2"
      />
      <path d="M984 114V306" stroke="rgb(11 125 255 / 0.16)" strokeWidth="1.1" />
      <rect
        x="958"
        y="98"
        width="52"
        height="32"
        rx="9"
        fill="rgb(255 255 255 / 0.78)"
        stroke="rgb(11 125 255 / 0.2)"
      />
      <rect
        x="958"
        y="194"
        width="52"
        height="32"
        rx="9"
        fill="rgb(255 255 255 / 0.78)"
        stroke="rgb(1 208 252 / 0.28)"
      />
      <rect
        x="958"
        y="290"
        width="52"
        height="32"
        rx="9"
        fill="rgb(255 255 255 / 0.78)"
        stroke="rgb(11 125 255 / 0.2)"
      />
      <path
        d="M1034 168c18 8 28 20 28 42s-10 34-28 42"
        stroke="rgb(1 208 252 / 0.28)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
