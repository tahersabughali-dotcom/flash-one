import type { AIRealWorkIcon } from "@/data/ai-real-work";

export function AIRealWorkMark({ type }: { type: AIRealWorkIcon }) {
  const className = "h-auto w-full";

  if (type === "documents") {
    return (
      <svg viewBox="0 0 168 64" className={className} fill="none" aria-hidden="true">
        <rect x="8" y="14" width="28" height="36" rx="5" fill="rgb(255 255 255 / 0.72)" stroke="rgb(11 125 255 / 0.16)" />
        <rect x="20" y="10" width="30" height="40" rx="5" fill="rgb(255 255 255 / 0.82)" stroke="rgb(11 125 255 / 0.2)" />
        <rect x="34" y="8" width="32" height="44" rx="6" fill="rgb(255 255 255 / 0.94)" stroke="rgb(11 125 255 / 0.24)" />
        <path d="M42 20h16M42 28h12M42 36h8" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="122" cy="32" r="16" stroke="rgb(1 208 252 / 0.34)" strokeWidth="1.4" />
        <circle cx="122" cy="32" r="4" fill="#0b7dff" />
        <path d="M68 32H106" stroke="rgb(1 208 252 / 0.3)" strokeWidth="1.2" />
        <path d="M133 43 146 54" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "support") {
    return (
      <svg viewBox="0 0 168 64" className={className} fill="none" aria-hidden="true">
        <rect x="8" y="14" width="46" height="18" rx="7" fill="rgb(255 255 255 / 0.78)" stroke="rgb(11 125 255 / 0.16)" />
        <rect x="18" y="38" width="38" height="14" rx="7" fill="rgb(255 255 255 / 0.7)" stroke="rgb(1 208 252 / 0.2)" />
        <path d="M62 30H78" stroke="rgb(11 125 255 / 0.22)" strokeWidth="1.15" />
        <rect x="82" y="10" width="78" height="44" rx="12" fill="rgb(255 255 255 / 0.92)" stroke="rgb(1 208 252 / 0.3)" />
        <path d="M96 24h50M96 34h36M96 44h22" stroke="rgb(11 125 255 / 0.3)" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "operations") {
    return (
      <svg viewBox="0 0 168 64" className={className} fill="none" aria-hidden="true">
        <rect x="8" y="14" width="36" height="16" rx="5" fill="rgb(255 255 255 / 0.82)" stroke="rgb(11 125 255 / 0.18)" />
        <rect x="50" y="14" width="36" height="16" rx="5" fill="rgb(255 255 255 / 0.82)" stroke="rgb(1 208 252 / 0.22)" />
        <rect x="8" y="36" width="36" height="16" rx="5" fill="rgb(255 255 255 / 0.82)" stroke="rgb(11 125 255 / 0.16)" />
        <rect x="50" y="36" width="36" height="16" rx="5" fill="rgb(255 255 255 / 0.9)" stroke="rgb(11 125 255 / 0.24)" />
        <circle cx="80" cy="44" r="2.4" fill="#01d0fc" />
        <path d="M96 32H112" stroke="rgb(1 208 252 / 0.28)" strokeWidth="1.15" />
        <rect x="116" y="18" width="44" height="28" rx="8" fill="rgb(255 255 255 / 0.92)" stroke="rgb(11 125 255 / 0.22)" />
        <path d="M128 32h20" stroke="rgb(11 125 255 / 0.3)" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "data") {
    return (
      <svg viewBox="0 0 168 64" className={className} fill="none" aria-hidden="true">
        <path d="M10 46 28 30 44 38 64 18" stroke="rgb(11 125 255 / 0.24)" strokeWidth="1.3" />
        <circle cx="10" cy="46" r="2.2" fill="#0b7dff" opacity="0.4" />
        <circle cx="28" cy="30" r="2.2" fill="#01d0fc" opacity="0.4" />
        <circle cx="44" cy="38" r="2.2" fill="#0b7dff" opacity="0.4" />
        <circle cx="64" cy="18" r="2.2" fill="#01d0fc" opacity="0.45" />
        <rect x="78" y="38" width="8" height="14" rx="2" fill="rgb(11 125 255 / 0.16)" />
        <rect x="90" y="28" width="8" height="24" rx="2" fill="rgb(1 208 252 / 0.22)" />
        <rect x="102" y="20" width="8" height="32" rx="2" fill="rgb(11 125 255 / 0.28)" />
        <rect x="122" y="12" width="38" height="40" rx="10" fill="rgb(255 255 255 / 0.92)" stroke="rgb(11 125 255 / 0.2)" />
        <path d="M134 40 144 28 152 34" stroke="rgb(1 208 252 / 0.5)" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "workflows") {
    return (
      <svg viewBox="0 0 168 64" className={className} fill="none" aria-hidden="true">
        <rect x="8" y="20" width="28" height="24" rx="7" fill="rgb(255 255 255 / 0.8)" stroke="rgb(11 125 255 / 0.18)" />
        <path d="M36 32H50" stroke="rgb(1 208 252 / 0.3)" strokeWidth="1.2" />
        <rect x="50" y="16" width="32" height="32" rx="8" fill="rgb(255 255 255 / 0.9)" stroke="rgb(1 208 252 / 0.28)" />
        <path d="M82 32H96" stroke="rgb(1 208 252 / 0.3)" strokeWidth="1.2" />
        <rect x="96" y="20" width="28" height="24" rx="7" fill="rgb(255 255 255 / 0.8)" stroke="rgb(11 125 255 / 0.18)" />
        <path d="M124 32H136" stroke="rgb(11 125 255 / 0.24)" strokeWidth="1.15" />
        <circle cx="148" cy="32" r="8" fill="rgb(255 255 255 / 0.92)" stroke="rgb(11 125 255 / 0.26)" />
        <circle cx="148" cy="32" r="3" fill="#0b7dff" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 168 64" className={className} fill="none" aria-hidden="true">
      <rect x="8" y="10" width="46" height="44" rx="10" fill="rgb(255 255 255 / 0.78)" stroke="rgb(11 125 255 / 0.16)" />
      <rect x="16" y="18" width="30" height="8" rx="3" fill="rgb(11 125 255 / 0.1)" />
      <rect x="16" y="30" width="22" height="6" rx="3" fill="rgb(11 125 255 / 0.08)" />
      <rect x="62" y="10" width="50" height="44" rx="10" fill="rgb(255 255 255 / 0.92)" stroke="rgb(1 208 252 / 0.32)" />
      <rect x="72" y="20" width="30" height="24" rx="6" fill="rgb(11 125 255 / 0.08)" stroke="rgb(1 208 252 / 0.22)" />
      <circle cx="87" cy="32" r="3.5" fill="#01d0fc" />
      <rect x="120" y="16" width="40" height="14" rx="5" fill="rgb(255 255 255 / 0.8)" stroke="rgb(11 125 255 / 0.16)" />
      <rect x="120" y="36" width="40" height="14" rx="5" fill="rgb(255 255 255 / 0.8)" stroke="rgb(11 125 255 / 0.16)" />
    </svg>
  );
}

export function AIRealWorkWorkspace({
  compact = false,
  railId = "real-work-rail",
}: {
  compact?: boolean;
  railId?: string;
}) {
  if (compact) {
    return (
      <div
        className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/70 shadow-(--shadow-glass)"
        aria-hidden="true"
      >
        <div className="flex items-center gap-1.5 border-b border-line/70 px-4 py-2">
          <span className="size-1.5 rounded-full bg-cyan/55" />
          <span className="size-1.5 rounded-full bg-blue/40" />
          <span className="size-1.5 rounded-full bg-navy/15" />
        </div>
        <div className="relative px-4 py-4">
          <svg viewBox="0 0 640 88" className="h-auto w-full" fill="none">
            <rect
              x="24"
              y="36"
              width="592"
              height="10"
              rx="5"
              fill="rgb(11 125 255 / 0.1)"
            />
            <rect x="40" y="38" width="560" height="6" rx="3" fill={`url(#${railId})`} />
            <rect x="48" y="16" width="34" height="22" rx="6" fill="rgb(255 255 255 / 0.9)" stroke="rgb(11 125 255 / 0.18)" />
            <rect x="140" y="50" width="34" height="22" rx="6" fill="rgb(255 255 255 / 0.9)" stroke="rgb(1 208 252 / 0.22)" />
            <rect x="248" y="14" width="40" height="24" rx="7" fill="rgb(255 255 255 / 0.94)" stroke="rgb(11 125 255 / 0.2)" />
            <rect x="360" y="50" width="34" height="22" rx="6" fill="rgb(255 255 255 / 0.9)" stroke="rgb(11 125 255 / 0.18)" />
            <rect x="468" y="16" width="40" height="22" rx="7" fill="rgb(255 255 255 / 0.9)" stroke="rgb(1 208 252 / 0.22)" />
            <rect x="558" y="48" width="36" height="24" rx="7" fill="rgb(255 255 255 / 0.94)" stroke="rgb(11 125 255 / 0.22)" />
            <circle cx="86" cy="41" r="3" fill="#0b7dff" />
            <circle cx="268" cy="41" r="3" fill="#01d0fc" />
            <circle cx="488" cy="41" r="3" fill="#0b7dff" />
            <defs>
              <linearGradient id={railId} x1="40" y1="41" x2="600" y2="41" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0b7dff" stopOpacity="0.15" />
                <stop offset="0.5" stopColor="#01d0fc" stopOpacity="0.7" />
                <stop offset="1" stopColor="#0b7dff" stopOpacity="0.15" />
              </linearGradient>
            </defs>
          </svg>
          <p className="mt-1 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-navy/40">
            Flash One Intelligence Layer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto flex h-full min-h-[30rem] w-full max-w-[22rem] flex-col"
      aria-hidden="true"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/72 shadow-(--shadow-glass) backdrop-blur-md">
        <div className="flex items-center gap-1.5 border-b border-line/70 px-4 py-2.5">
          <span className="size-1.5 rounded-full bg-cyan/55" />
          <span className="size-1.5 rounded-full bg-blue/40" />
          <span className="size-1.5 rounded-full bg-navy/15" />
        </div>
        <div className="relative flex flex-1 flex-col px-4 pb-5 pt-4">
          <div className="pointer-events-none absolute inset-x-[16%] inset-y-[10%] rounded-full bg-[radial-gradient(circle,rgb(1_208_252/0.12),transparent_68%)]" />
          <div className="absolute top-4 bottom-16 left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-blue/10" />
          <div className="absolute top-6 bottom-[4.5rem] left-1/2 w-1 -translate-x-1/2 rounded-full bg-linear-to-b from-blue/25 via-cyan to-blue/25" />
          <div className="relative flex flex-1 flex-col justify-between py-3">
            <div className="flex items-start justify-between gap-3">
              <span className="h-9 w-[4.6rem] rounded-lg border border-blue/20 bg-white/90" />
              <span className="mt-3 h-8 w-[4.6rem] rounded-lg border border-cyan/30 bg-white/90" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="grid grid-cols-2 gap-1">
                <span className="h-3.5 w-7 rounded border border-blue/15 bg-white/85" />
                <span className="h-3.5 w-7 rounded border border-cyan/20 bg-white/85" />
                <span className="h-3.5 w-7 rounded border border-blue/15 bg-white/85" />
                <span className="h-3.5 w-7 rounded border border-blue/25 bg-white/90" />
              </span>
              <span className="flex h-10 w-16 items-end justify-center gap-1 rounded-lg border border-blue/15 bg-white/90 px-2 pb-1.5">
                <span className="h-3 w-1 rounded-sm bg-blue/25" />
                <span className="h-5 w-1 rounded-sm bg-cyan/40" />
                <span className="h-4 w-1 rounded-sm bg-blue/30" />
              </span>
            </div>
            <div className="flex items-end justify-between gap-3">
              <span className="flex items-center gap-1">
                <span className="size-6 rounded-md border border-blue/15 bg-white/90" />
                <span className="size-6 rounded-md border border-cyan/25 bg-white/90" />
              </span>
              <span className="flex h-11 w-[4.6rem] items-center justify-center rounded-xl border border-cyan/30 bg-white/95">
                <span className="size-2.5 rounded-full bg-cyan" />
              </span>
            </div>
          </div>
          <p className="relative mt-3 text-center text-[10px] font-semibold uppercase leading-relaxed tracking-[0.18em] text-navy/40">
            Flash One
            <span className="mt-0.5 block tracking-[0.16em]">Intelligence Layer</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function AIRealWorkField() {
  return (
    <svg
      viewBox="0 0 1000 720"
      className="h-full w-full"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path d="M210 90C300 150 380 200 500 250" stroke="rgb(11 125 255 / 0.14)" strokeWidth="1.1" />
      <path d="M790 90C700 150 620 200 500 250" stroke="rgb(1 208 252 / 0.16)" strokeWidth="1.1" />
      <path d="M210 360H430" stroke="rgb(11 125 255 / 0.12)" strokeWidth="1.05" />
      <path d="M790 360H570" stroke="rgb(1 208 252 / 0.14)" strokeWidth="1.05" />
      <path d="M210 620C300 560 380 510 500 470" stroke="rgb(11 125 255 / 0.12)" strokeWidth="1.05" />
      <path d="M790 620C700 560 620 510 500 470" stroke="rgb(1 208 252 / 0.14)" strokeWidth="1.05" />
    </svg>
  );
}
