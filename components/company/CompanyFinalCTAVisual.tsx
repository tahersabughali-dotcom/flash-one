type CompanyFinalCTAVisualProps = {
  compact?: boolean;
};

export function CompanyFinalCTAVisual({
  compact = false,
}: CompanyFinalCTAVisualProps) {
  if (compact) {
    return (
      <div
        className="relative mx-auto w-full max-w-lg overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/65 px-3 py-3.5 shadow-(--shadow-glass)"
        aria-hidden="true"
      >
        <svg viewBox="0 0 560 88" className="h-auto w-full" fill="none">
          <circle cx="36" cy="44" r="4" fill="#0b7dff" />
          <circle cx="36" cy="44" r="9" stroke="rgb(11 125 255 / 0.2)" />
          <rect
            x="18"
            y="18"
            width="16"
            height="11"
            rx="3"
            fill="rgb(255 255 255 / 0.86)"
            stroke="rgb(11 125 255 / 0.16)"
          />
          <path
            d="M48 44H168"
            stroke="rgb(11 125 255 / 0.28)"
            strokeWidth="1.2"
          />
          <rect
            x="168"
            y="18"
            width="168"
            height="52"
            rx="14"
            fill="url(#company-next-step-glow-compact)"
            stroke="rgb(11 125 255 / 0.22)"
          />
          <rect
            x="188"
            y="32"
            width="52"
            height="24"
            rx="7"
            fill="rgb(255 255 255 / 0.94)"
            stroke="rgb(11 125 255 / 0.2)"
          />
          <rect
            x="248"
            y="32"
            width="64"
            height="24"
            rx="7"
            fill="rgb(255 255 255 / 0.9)"
            stroke="rgb(1 208 252 / 0.26)"
          />
          <path
            d="M336 44H392"
            stroke="rgb(1 208 252 / 0.28)"
            strokeWidth="1.2"
          />
          <rect
            x="392"
            y="16"
            width="48"
            height="22"
            rx="7"
            fill="rgb(255 255 255 / 0.92)"
            stroke="rgb(11 125 255 / 0.18)"
          />
          <rect
            x="448"
            y="32"
            width="48"
            height="22"
            rx="7"
            fill="rgb(255 255 255 / 0.92)"
            stroke="rgb(1 208 252 / 0.24)"
          />
          <rect
            x="400"
            y="52"
            width="40"
            height="18"
            rx="6"
            fill="rgb(255 255 255 / 0.86)"
            stroke="rgb(11 125 255 / 0.16)"
          />
          <defs>
            <linearGradient
              id="company-next-step-glow-compact"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor="rgb(255 255 255 / 0.9)" />
              <stop offset="100%" stopColor="rgb(1 208 252 / 0.16)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto w-full max-w-[20rem] overflow-hidden sm:max-w-[22rem] lg:max-w-none"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-[12%] rounded-[2rem] bg-[radial-gradient(circle_at_48%_50%,rgb(255_255_255/0.96),rgb(1_208_252/0.14)_46%,transparent_74%)]" />
      <svg viewBox="0 0 320 240" className="relative h-auto w-full" fill="none">
        <rect
          x="18"
          y="78"
          width="22"
          height="14"
          rx="4"
          fill="rgb(255 255 255 / 0.86)"
          stroke="rgb(11 125 255 / 0.16)"
        />
        <circle cx="42" cy="120" r="5" fill="#0b7dff" />
        <circle cx="42" cy="120" r="11" stroke="rgb(11 125 255 / 0.2)" />
        <text
          x="42"
          y="154"
          textAnchor="middle"
          fill="rgb(11 47 99 / 0.38)"
          fontSize="8"
          fontWeight="700"
          letterSpacing="1.4"
        >
          IDEA
        </text>

        <path
          d="M54 120H108"
          stroke="rgb(11 125 255 / 0.28)"
          strokeWidth="1.25"
        />

        <rect
          x="108"
          y="58"
          width="104"
          height="124"
          rx="22"
          fill="url(#company-next-step-glow)"
          stroke="rgb(11 125 255 / 0.22)"
        />
        <rect
          x="124"
          y="84"
          width="72"
          height="36"
          rx="10"
          fill="rgb(255 255 255 / 0.94)"
          stroke="rgb(11 125 255 / 0.2)"
        />
        <rect
          x="124"
          y="128"
          width="72"
          height="28"
          rx="9"
          fill="rgb(255 255 255 / 0.88)"
          stroke="rgb(1 208 252 / 0.26)"
        />
        <path
          d="M136 98h40M136 108h24"
          stroke="rgb(11 125 255 / 0.28)"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <text
          x="160"
          y="198"
          textAnchor="middle"
          fill="rgb(11 47 99 / 0.38)"
          fontSize="8"
          fontWeight="700"
          letterSpacing="1.1"
        >
          DIRECTION
        </text>

        <path
          d="M212 88C236 72 258 58 278 46"
          stroke="rgb(1 208 252 / 0.24)"
          strokeWidth="1.15"
        />
        <path d="M212 120H278" stroke="rgb(11 125 255 / 0.22)" strokeWidth="1.15" />
        <path
          d="M212 152C236 168 258 182 278 194"
          stroke="rgb(11 125 255 / 0.2)"
          strokeWidth="1.15"
        />

        <rect
          x="278"
          y="28"
          width="28"
          height="20"
          rx="6"
          fill="rgb(255 255 255 / 0.72)"
          stroke="rgb(11 125 255 / 0.16)"
        />
        <rect
          x="278"
          y="108"
          width="28"
          height="20"
          rx="6"
          fill="rgb(255 255 255 / 0.86)"
          stroke="rgb(1 208 252 / 0.24)"
        />
        <rect
          x="278"
          y="184"
          width="24"
          height="16"
          rx="5"
          fill="rgb(255 255 255 / 0.62)"
          stroke="rgb(11 125 255 / 0.14)"
        />
        <text
          x="292"
          y="228"
          textAnchor="middle"
          fill="rgb(11 47 99 / 0.38)"
          fontSize="8"
          fontWeight="700"
          letterSpacing="0.8"
        >
          POSSIBILITY
        </text>
        <defs>
          <linearGradient
            id="company-next-step-glow"
            x1="0.2"
            y1="0"
            x2="0.85"
            y2="1"
          >
            <stop offset="0%" stopColor="rgb(255 255 255 / 0.9)" />
            <stop offset="100%" stopColor="rgb(1 208 252 / 0.16)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
