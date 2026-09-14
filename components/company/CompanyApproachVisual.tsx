type CompanyApproachVisualProps = {
  compact?: boolean;
};

export function CompanyApproachVisual({
  compact = false,
}: CompanyApproachVisualProps) {
  if (compact) {
    return (
      <div
        className="relative mx-auto w-full max-w-2xl overflow-hidden"
        aria-hidden="true"
      >
        <svg viewBox="0 0 640 110" className="h-auto w-full" fill="none">
          <rect
            x="16"
            y="34"
            width="86"
            height="40"
            rx="12"
            fill="rgb(255 255 255 / 0.78)"
            stroke="rgb(11 125 255 / 0.16)"
          />
          <circle cx="36" cy="48" r="2.2" fill="#0b7dff" opacity="0.5" />
          <circle cx="52" cy="60" r="1.8" fill="#01d0fc" opacity="0.5" />
          <rect
            x="64"
            y="46"
            width="22"
            height="12"
            rx="3"
            fill="rgb(255 255 255 / 0.9)"
            stroke="rgb(11 125 255 / 0.18)"
          />
          <text
            x="59"
            y="92"
            textAnchor="middle"
            fill="rgb(11 47 99 / 0.4)"
            fontSize="8"
            fontWeight="700"
            letterSpacing="1.1"
          >
            REAL NEED
          </text>

          <path
            d="M102 54C148 54 176 54 214 54"
            stroke="rgb(11 125 255 / 0.28)"
            strokeWidth="1.2"
          />

          <rect
            x="214"
            y="22"
            width="212"
            height="64"
            rx="16"
            fill="url(#company-working-model-glow-compact)"
            stroke="rgb(11 125 255 / 0.22)"
          />
          <rect
            x="248"
            y="40"
            width="48"
            height="28"
            rx="8"
            fill="rgb(255 255 255 / 0.92)"
            stroke="rgb(11 125 255 / 0.2)"
          />
          <rect
            x="304"
            y="40"
            width="48"
            height="28"
            rx="8"
            fill="rgb(255 255 255 / 0.92)"
            stroke="rgb(1 208 252 / 0.28)"
          />
          <rect
            x="360"
            y="40"
            width="28"
            height="28"
            rx="8"
            fill="rgb(255 255 255 / 0.86)"
            stroke="rgb(11 125 255 / 0.16)"
          />
          <circle cx="320" cy="54" r="3" fill="#0b7dff" />
          <text
            x="320"
            y="102"
            textAnchor="middle"
            fill="rgb(11 47 99 / 0.4)"
            fontSize="8"
            fontWeight="700"
            letterSpacing="1.1"
          >
            WORKING SPACE
          </text>

          <path
            d="M426 54C464 54 492 54 538 54"
            stroke="rgb(1 208 252 / 0.28)"
            strokeWidth="1.2"
          />

          <rect
            x="538"
            y="30"
            width="86"
            height="48"
            rx="12"
            fill="rgb(255 255 255 / 0.84)"
            stroke="rgb(1 208 252 / 0.24)"
          />
          <rect
            x="552"
            y="42"
            width="18"
            height="12"
            rx="3"
            fill="rgb(255 255 255 / 0.95)"
            stroke="rgb(11 125 255 / 0.18)"
          />
          <rect
            x="576"
            y="42"
            width="18"
            height="12"
            rx="3"
            fill="rgb(255 255 255 / 0.95)"
            stroke="rgb(1 208 252 / 0.22)"
          />
          <rect
            x="564"
            y="58"
            width="22"
            height="10"
            rx="3"
            fill="rgb(255 255 255 / 0.9)"
            stroke="rgb(11 125 255 / 0.16)"
          />
          <text
            x="581"
            y="96"
            textAnchor="middle"
            fill="rgb(11 47 99 / 0.4)"
            fontSize="8"
            fontWeight="700"
            letterSpacing="0.7"
          >
            TECHNOLOGY
          </text>
          <defs>
            <linearGradient
              id="company-working-model-glow-compact"
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
    <div className="relative mx-auto w-full max-w-[22rem]" aria-hidden="true">
      <div className="pointer-events-none absolute inset-[10%] rounded-[2rem] bg-[radial-gradient(circle_at_50%_48%,rgb(255_255_255/0.95),rgb(1_208_252/0.14)_48%,transparent_74%)]" />
      <svg viewBox="0 0 280 300" className="relative h-auto w-full" fill="none">
        <rect
          x="18"
          y="28"
          width="72"
          height="44"
          rx="12"
          fill="rgb(255 255 255 / 0.78)"
          stroke="rgb(11 125 255 / 0.16)"
        />
        <circle cx="36" cy="44" r="2.4" fill="#0b7dff" opacity="0.5" />
        <circle cx="52" cy="54" r="2" fill="#01d0fc" opacity="0.5" />
        <rect
          x="62"
          y="42"
          width="18"
          height="11"
          rx="3"
          fill="rgb(255 255 255 / 0.92)"
          stroke="rgb(11 125 255 / 0.18)"
        />
        <text
          x="54"
          y="88"
          textAnchor="middle"
          fill="rgb(11 47 99 / 0.4)"
          fontSize="8"
          fontWeight="700"
          letterSpacing="1.1"
        >
          REAL NEED
        </text>

        <rect
          x="190"
          y="28"
          width="72"
          height="44"
          rx="12"
          fill="rgb(255 255 255 / 0.78)"
          stroke="rgb(1 208 252 / 0.22)"
        />
        <rect
          x="202"
          y="40"
          width="16"
          height="12"
          rx="3"
          fill="rgb(255 255 255 / 0.94)"
          stroke="rgb(11 125 255 / 0.18)"
        />
        <rect
          x="222"
          y="40"
          width="16"
          height="12"
          rx="3"
          fill="rgb(255 255 255 / 0.94)"
          stroke="rgb(1 208 252 / 0.24)"
        />
        <rect
          x="214"
          y="56"
          width="20"
          height="8"
          rx="2.5"
          fill="rgb(255 255 255 / 0.88)"
          stroke="rgb(11 125 255 / 0.14)"
        />
        <text
          x="226"
          y="88"
          textAnchor="middle"
          fill="rgb(11 47 99 / 0.4)"
          fontSize="8"
          fontWeight="700"
          letterSpacing="0.6"
        >
          TECHNOLOGY
        </text>

        <path
          d="M90 50C112 50 118 118 140 132"
          stroke="rgb(11 125 255 / 0.28)"
          strokeWidth="1.25"
        />
        <path
          d="M190 50C168 50 162 118 140 132"
          stroke="rgb(1 208 252 / 0.26)"
          strokeWidth="1.25"
        />

        <rect
          x="58"
          y="118"
          width="164"
          height="92"
          rx="22"
          fill="url(#company-working-model-glow)"
          stroke="rgb(11 125 255 / 0.22)"
        />
        <rect
          x="80"
          y="140"
          width="40"
          height="28"
          rx="8"
          fill="rgb(255 255 255 / 0.94)"
          stroke="rgb(11 125 255 / 0.2)"
        />
        <rect
          x="128"
          y="140"
          width="40"
          height="28"
          rx="8"
          fill="rgb(255 255 255 / 0.94)"
          stroke="rgb(1 208 252 / 0.28)"
        />
        <rect
          x="176"
          y="140"
          width="28"
          height="28"
          rx="8"
          fill="rgb(255 255 255 / 0.88)"
          stroke="rgb(11 125 255 / 0.16)"
        />
        <circle cx="140" cy="186" r="3.4" fill="#0b7dff" />
        <path
          d="M88 186h36M156 186h36"
          stroke="rgb(11 125 255 / 0.2)"
          strokeWidth="1.1"
        />
        <text
          x="140"
          y="226"
          textAnchor="middle"
          fill="rgb(11 47 99 / 0.4)"
          fontSize="8"
          fontWeight="700"
          letterSpacing="1.2"
        >
          WORKING SPACE
        </text>

        <path d="M140 210V236" stroke="rgb(11 125 255 / 0.22)" strokeWidth="1.2" />

        <rect
          x="78"
          y="236"
          width="124"
          height="40"
          rx="12"
          fill="rgb(255 255 255 / 0.94)"
          stroke="rgb(11 125 255 / 0.22)"
        />
        <path
          d="M96 250h88M96 262h58"
          stroke="rgb(11 125 255 / 0.28)"
          strokeWidth="1.15"
          strokeLinecap="round"
        />
        <text
          x="140"
          y="292"
          textAnchor="middle"
          fill="rgb(11 47 99 / 0.4)"
          fontSize="8"
          fontWeight="700"
          letterSpacing="0.8"
        >
          CLEAR DIRECTION
        </text>
        <defs>
          <linearGradient
            id="company-working-model-glow"
            x1="0.2"
            y1="0"
            x2="0.8"
            y2="1"
          >
            <stop offset="0%" stopColor="rgb(255 255 255 / 0.9)" />
            <stop offset="100%" stopColor="rgb(1 208 252 / 0.18)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
