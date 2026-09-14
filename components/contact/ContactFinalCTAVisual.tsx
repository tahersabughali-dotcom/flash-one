type ContactFinalCTAVisualProps = {
  compact?: boolean;
};

export function ContactFinalCTAVisual({
  compact = false,
}: ContactFinalCTAVisualProps) {
  if (compact) {
    return (
      <div
        className="relative mx-auto w-full max-w-lg overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/65 px-3 py-3.5 shadow-(--shadow-glass)"
        aria-hidden="true"
      >
        <svg viewBox="0 0 560 80" className="h-auto w-full" fill="none">
          <circle cx="48" cy="40" r="4.2" fill="#0b7dff" />
          <circle cx="48" cy="40" r="10" stroke="rgb(11 125 255 / 0.2)" />
          <path
            d="M62 40C140 40 200 40 280 40"
            stroke="url(#contact-signal-compact)"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <rect
            x="280"
            y="22"
            width="72"
            height="36"
            rx="12"
            fill="rgb(255 255 255 / 0.92)"
            stroke="rgb(11 125 255 / 0.2)"
          />
          <path
            d="M352 40H430"
            stroke="rgb(1 208 252 / 0.3)"
            strokeWidth="1.2"
          />
          <circle
            cx="452"
            cy="40"
            r="8"
            fill="rgb(255 255 255 / 0.8)"
            stroke="rgb(11 125 255 / 0.2)"
          />
          <circle cx="452" cy="40" r="3" fill="#01d0fc" />
          <defs>
            <linearGradient id="contact-signal-compact" x1="62" y1="40" x2="280" y2="40">
              <stop offset="0%" stopColor="#0b7dff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#01d0fc" stopOpacity="0.7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto w-full max-w-[18rem] overflow-hidden sm:max-w-[20rem] lg:max-w-none"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-[16%] rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.96),rgb(1_208_252/0.14)_48%,transparent_74%)]" />
      <svg viewBox="0 0 280 200" className="relative h-auto w-full" fill="none">
        <circle cx="48" cy="100" r="5" fill="#0b7dff" />
        <circle cx="48" cy="100" r="12" stroke="rgb(11 125 255 / 0.2)" />
        <path
          d="M62 100H118"
          stroke="url(#contact-signal-glow)"
          strokeWidth="1.35"
          strokeLinecap="round"
        />
        <ellipse
          cx="168"
          cy="100"
          rx="42"
          ry="42"
          fill="rgb(255 255 255 / 0.55)"
          stroke="rgb(11 125 255 / 0.18)"
        />
        <ellipse
          cx="168"
          cy="100"
          rx="24"
          ry="24"
          fill="rgb(255 255 255 / 0.9)"
          stroke="rgb(1 208 252 / 0.28)"
        />
        <circle cx="168" cy="100" r="4" fill="#0b7dff" />
        <path
          d="M210 100H246"
          stroke="rgb(1 208 252 / 0.28)"
          strokeWidth="1.2"
        />
        <rect
          x="246"
          y="90"
          width="22"
          height="20"
          rx="6"
          fill="rgb(255 255 255 / 0.86)"
          stroke="rgb(11 125 255 / 0.18)"
        />
        <defs>
          <linearGradient id="contact-signal-glow" x1="62" y1="100" x2="118" y2="100">
            <stop offset="0%" stopColor="#0b7dff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#01d0fc" stopOpacity="0.7" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
