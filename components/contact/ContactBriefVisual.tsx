type ContactBriefVisualProps = {
  compact?: boolean;
};

export function ContactBriefVisual({ compact = false }: ContactBriefVisualProps) {
  if (compact) {
    return (
      <div
        className="relative mx-auto w-full max-w-lg overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/70 px-4 py-4 shadow-(--shadow-glass)"
        aria-hidden="true"
      >
        <svg viewBox="0 0 560 88" className="h-auto w-full" fill="none">
          <rect
            x="16"
            y="12"
            width="528"
            height="64"
            rx="14"
            fill="rgb(255 255 255 / 0.86)"
            stroke="rgb(11 125 255 / 0.16)"
          />
          <path d="M40 32h120" stroke="rgb(11 125 255 / 0.22)" strokeWidth="2" strokeLinecap="round" />
          <path d="M40 44h220" stroke="rgb(11 125 255 / 0.28)" strokeWidth="2" strokeLinecap="round" />
          <path d="M40 56h160" stroke="rgb(1 208 252 / 0.35)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="500" cy="44" r="4" fill="#0b7dff" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto w-full max-w-[20rem] overflow-hidden"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-[8%] rounded-[1.8rem] bg-[radial-gradient(circle_at_50%_40%,rgb(255_255_255/0.95),rgb(1_208_252/0.12)_50%,transparent_74%)]" />
      <svg viewBox="0 0 280 300" className="relative h-auto w-full" fill="none">
        <rect
          x="36"
          y="24"
          width="208"
          height="252"
          rx="22"
          fill="url(#contact-brief-glow)"
          stroke="rgb(11 125 255 / 0.18)"
        />
        <rect
          x="56"
          y="44"
          width="72"
          height="10"
          rx="5"
          fill="rgb(11 125 255 / 0.18)"
        />
        <path d="M56 78h152" stroke="rgb(11 125 255 / 0.16)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M56 108h128" stroke="rgb(11 125 255 / 0.22)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M56 138h168" stroke="rgb(11 125 255 / 0.3)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M56 168h96" stroke="rgb(1 208 252 / 0.32)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M56 198h140" stroke="rgb(11 125 255 / 0.38)" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="188" cy="238" r="5" fill="#0b7dff" />
        <text
          x="140"
          y="270"
          textAnchor="middle"
          fill="rgb(11 47 99 / 0.38)"
          fontSize="9"
          fontWeight="700"
          letterSpacing="1.1"
        >
          A FEW ANSWERS
        </text>
        <defs>
          <linearGradient id="contact-brief-glow" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="rgb(255 255 255 / 0.94)" />
            <stop offset="100%" stopColor="rgb(1 208 252 / 0.12)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
