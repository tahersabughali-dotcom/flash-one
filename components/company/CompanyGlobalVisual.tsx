type CompanyGlobalVisualProps = {
  compact?: boolean;
};

export function CompanyGlobalVisual({
  compact = false,
}: CompanyGlobalVisualProps) {
  if (compact) {
    return (
      <div className="relative mx-auto w-full max-w-2xl" aria-hidden="true">
        <svg viewBox="0 0 640 88" className="h-auto w-full" fill="none">
          <path
            d="M24 58C120 46 220 62 320 50C420 38 520 54 616 42"
            stroke="url(#company-connected-horizon-compact)"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path
            d="M40 70C150 64 260 74 380 62C480 54 560 64 620 58"
            stroke="rgb(1 208 252 / 0.16)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <ellipse
            cx="320"
            cy="36"
            rx="86"
            ry="16"
            fill="rgb(255 255 255 / 0.28)"
            stroke="rgb(11 125 255 / 0.12)"
          />
          <circle cx="86" cy="52" r="3.2" fill="#0b7dff" opacity="0.55" />
          <circle cx="210" cy="44" r="2.4" fill="#01d0fc" opacity="0.5" />
          <circle cx="320" cy="36" r="3.6" fill="#0b7dff" />
          <circle cx="430" cy="42" r="2.4" fill="#01d0fc" opacity="0.5" />
          <circle cx="548" cy="46" r="3" fill="#0b7dff" opacity="0.45" />
          <path
            d="M86 52C160 28 240 22 320 36"
            stroke="rgb(11 125 255 / 0.18)"
            strokeWidth="1"
          />
          <path
            d="M320 36C400 22 480 28 548 46"
            stroke="rgb(1 208 252 / 0.18)"
            strokeWidth="1"
          />
          <rect
            x="300"
            y="18"
            width="18"
            height="12"
            rx="3"
            fill="rgb(255 255 255 / 0.8)"
            stroke="rgb(11 125 255 / 0.16)"
          />
          <defs>
            <linearGradient
              id="company-connected-horizon-compact"
              x1="24"
              y1="58"
              x2="616"
              y2="42"
            >
              <stop offset="0%" stopColor="#0b7dff" stopOpacity="0.18" />
              <stop offset="50%" stopColor="#01d0fc" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0b7dff" stopOpacity="0.16" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div className="relative w-full" aria-hidden="true">
      <svg viewBox="0 0 1200 160" className="h-auto w-full" fill="none">
        <ellipse
          cx="600"
          cy="72"
          rx="280"
          ry="36"
          fill="url(#company-connected-horizon-glow)"
        />
        <path
          d="M40 108C180 86 320 118 480 92C640 66 780 104 960 78C1080 62 1140 70 1164 64"
          stroke="url(#company-connected-horizon-stroke)"
          strokeWidth="1.45"
          strokeLinecap="round"
        />
        <path
          d="M80 128C240 118 420 136 620 112C800 92 980 118 1140 100"
          stroke="rgb(1 208 252 / 0.16)"
          strokeWidth="1.05"
          strokeLinecap="round"
        />
        <path
          d="M120 88C280 54 460 48 600 72C760 52 940 58 1100 46"
          stroke="rgb(11 125 255 / 0.12)"
          strokeWidth="1"
          strokeLinecap="round"
        />

        <circle cx="168" cy="98" r="4.2" fill="#0b7dff" opacity="0.55" />
        <circle cx="168" cy="98" r="10" stroke="rgb(11 125 255 / 0.16)" />
        <circle cx="356" cy="84" r="3" fill="#01d0fc" opacity="0.5" />
        <circle cx="600" cy="72" r="5" fill="#0b7dff" />
        <circle cx="600" cy="72" r="14" stroke="rgb(1 208 252 / 0.22)" />
        <circle cx="812" cy="86" r="3.2" fill="#01d0fc" opacity="0.48" />
        <circle cx="1008" cy="70" r="4" fill="#0b7dff" opacity="0.42" />
        <circle
          cx="1008"
          cy="70"
          r="9"
          stroke="rgb(11 125 255 / 0.14)"
        />

        <path
          d="M168 98C280 40 420 36 600 72"
          stroke="rgb(11 125 255 / 0.16)"
          strokeWidth="1.05"
        />
        <path
          d="M600 72C740 40 880 44 1008 70"
          stroke="rgb(1 208 252 / 0.16)"
          strokeWidth="1.05"
        />
        <path d="M356 84H600" stroke="rgb(11 125 255 / 0.12)" strokeWidth="1" />
        <path d="M600 72H812" stroke="rgb(1 208 252 / 0.12)" strokeWidth="1" />

        <rect
          x="148"
          y="54"
          width="22"
          height="14"
          rx="4"
          fill="rgb(255 255 255 / 0.72)"
          stroke="rgb(11 125 255 / 0.14)"
        />
        <rect
          x="578"
          y="28"
          width="28"
          height="18"
          rx="5"
          fill="rgb(255 255 255 / 0.82)"
          stroke="rgb(11 125 255 / 0.16)"
        />
        <rect
          x="992"
          y="36"
          width="22"
          height="14"
          rx="4"
          fill="rgb(255 255 255 / 0.55)"
          stroke="rgb(1 208 252 / 0.16)"
        />
        <defs>
          <linearGradient
            id="company-connected-horizon-stroke"
            x1="40"
            y1="108"
            x2="1164"
            y2="64"
          >
            <stop offset="0%" stopColor="#0b7dff" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#01d0fc" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#0b7dff" stopOpacity="0.12" />
          </linearGradient>
          <radialGradient
            id="company-connected-horizon-glow"
            cx="0.5"
            cy="0.5"
            r="0.5"
          >
            <stop offset="0%" stopColor="rgb(1 208 252 / 0.16)" />
            <stop offset="100%" stopColor="rgb(1 208 252 / 0)" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
