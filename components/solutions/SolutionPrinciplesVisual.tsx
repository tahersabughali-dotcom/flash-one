import type { PrincipleIcon } from "@/data/solution-principles";

export function PrincipleMark({ type }: { type: PrincipleIcon }) {
  const className = "size-5";

  if (type === "custom") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
          d="M7 6.5h7.2L19 11.2V17.5A2 2 0 0 1 17 19.5H7A2 2 0 0 1 5 17.5V8.5A2 2 0 0 1 7 6.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M14.2 6.5V10a1.2 1.2 0 0 0 1.2 1.2H19" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  if (type === "connected") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <circle cx="7" cy="12" r="2.1" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17" cy="7.5" r="2.1" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17" cy="16.5" r="2.1" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 11.4 15 8.3M9 12.6 15 15.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "scalable") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <rect x="5.5" y="16.2" width="6.4" height="2.4" rx="0.7" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8.2" y="12" width="8.2" height="2.4" rx="0.7" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="7.8" width="8.4" height="2.4" rx="0.7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16.8 5.4 19.2 7.8H16.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6.5 15.2c2.4-4.6 4.8-5.4 8.2-3.2 2.6 1.7 4.4.8 5.3-1.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M17.2 8.2h3.1v3.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SolutionPrinciplesCore({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={[
        "relative mx-auto flex items-center justify-center",
        compact ? "h-[11.5rem] w-full max-w-sm" : "h-[20rem] w-full max-w-[20rem]",
      ].join(" ")}
      aria-hidden="true"
    >
      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.92),rgb(1_208_252/0.1)_42%,transparent_72%)]" />

      <svg
        viewBox="0 0 280 280"
        className={compact ? "h-[11.5rem] w-auto" : "h-[20rem] w-auto"}
        fill="none"
      >
        <circle cx="140" cy="140" r="118" stroke="rgb(11 125 255 / 0.12)" strokeWidth="1" />
        <circle cx="140" cy="140" r="88" stroke="rgb(1 208 252 / 0.22)" strokeWidth="1.2" />
        <circle cx="140" cy="140" r="62" stroke="rgb(11 125 255 / 0.18)" strokeWidth="1.15" />
        <rect
          x="96"
          y="96"
          width="88"
          height="88"
          rx="22"
          fill="rgb(255 255 255 / 0.72)"
          stroke="rgb(11 125 255 / 0.2)"
        />
        <rect
          x="110"
          y="110"
          width="60"
          height="60"
          rx="14"
          stroke="rgb(1 208 252 / 0.34)"
          strokeWidth="1.2"
        />
      </svg>

      <p className="absolute text-[10px] font-semibold tracking-[0.22em] text-navy/40 uppercase">
        Foundation
      </p>
    </div>
  );
}

export function SolutionPrinciplesField() {
  return (
    <svg
      viewBox="0 0 1100 520"
      className="h-auto w-full"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M170 88C280 150 360 190 470 230"
        stroke="rgb(11 125 255 / 0.22)"
        strokeWidth="1.2"
      />
      <path
        d="M930 88C820 150 740 190 630 230"
        stroke="rgb(1 208 252 / 0.26)"
        strokeWidth="1.2"
      />
      <path
        d="M170 432C280 370 360 330 470 290"
        stroke="rgb(11 125 255 / 0.2)"
        strokeWidth="1.2"
      />
      <path
        d="M930 432C820 370 740 330 630 290"
        stroke="rgb(1 208 252 / 0.22)"
        strokeWidth="1.2"
      />
      <circle cx="170" cy="88" r="3.4" fill="#0b7dff" opacity="0.55" />
      <circle cx="930" cy="88" r="3.4" fill="#01d0fc" opacity="0.55" />
      <circle cx="170" cy="432" r="3.4" fill="#0b7dff" opacity="0.5" />
      <circle cx="930" cy="432" r="3.4" fill="#01d0fc" opacity="0.5" />
    </svg>
  );
}
