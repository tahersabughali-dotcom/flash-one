type CompanyDirectionVisualProps = {
  variant?: "horizon" | "compact" | "vertical";
};

export function CompanyDirectionVisual({
  variant = "horizon",
}: CompanyDirectionVisualProps) {
  if (variant === "compact") {
    return (
      <div className="relative mx-auto w-full max-w-2xl" aria-hidden="true">
        <svg viewBox="0 0 640 78" className="h-auto w-full" fill="none">
          <path
            d="M28 38C130 38 190 26 286 30C390 34 448 22 534 20C572 19 604 16 618 14"
            stroke="url(#company-forward-compact-stroke)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M286 30C400 18 500 12 618 8"
            stroke="rgb(11 125 255 / 0.12)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="40" cy="38" r="4.2" fill="#0b7dff" />
          <circle cx="40" cy="38" r="9" stroke="rgb(11 125 255 / 0.22)" />
          <rect
            x="22"
            y="16"
            width="16"
            height="11"
            rx="3"
            fill="rgb(255 255 255 / 0.86)"
            stroke="rgb(11 125 255 / 0.16)"
          />
          <rect
            x="286"
            y="14"
            width="36"
            height="22"
            rx="6"
            fill="rgb(255 255 255 / 0.92)"
            stroke="rgb(11 125 255 / 0.22)"
          />
          <rect
            x="328"
            y="20"
            width="22"
            height="14"
            rx="4"
            fill="rgb(255 255 255 / 0.8)"
            stroke="rgb(1 208 252 / 0.3)"
          />
          <circle cx="304" cy="25" r="2.2" fill="#01d0fc" />
          <rect
            x="548"
            y="6"
            width="24"
            height="16"
            rx="5"
            fill="rgb(255 255 255 / 0.48)"
            stroke="rgb(11 125 255 / 0.14)"
          />
          <circle cx="592" cy="16" r="2.1" fill="#0b7dff" opacity="0.4" />
          <circle
            cx="618"
            cy="14"
            r="6"
            fill="rgb(255 255 255 / 0.4)"
            stroke="rgb(11 125 255 / 0.16)"
          />
          <text
            x="40"
            y="70"
            textAnchor="middle"
            fill="rgb(11 47 99 / 0.4)"
            fontSize="8"
            fontWeight="700"
            letterSpacing="1.4"
          >
            PURPOSE
          </text>
          <text
            x="310"
            y="70"
            textAnchor="middle"
            fill="rgb(11 47 99 / 0.4)"
            fontSize="8"
            fontWeight="700"
            letterSpacing="1.4"
          >
            DIRECTION
          </text>
          <text
            x="590"
            y="70"
            textAnchor="middle"
            fill="rgb(11 47 99 / 0.4)"
            fontSize="8"
            fontWeight="700"
            letterSpacing="1.4"
          >
            FUTURE
          </text>
          <defs>
            <linearGradient
              id="company-forward-compact-stroke"
              x1="28"
              y1="38"
              x2="618"
              y2="14"
            >
              <stop offset="0%" stopColor="#0b7dff" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#01d0fc" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0b7dff" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div className="relative h-full w-8" aria-hidden="true">
        <div className="absolute top-1 bottom-1 left-1/2 w-px -translate-x-1/2 bg-linear-to-b from-blue/50 via-cyan/40 to-blue/0" />
        <span className="absolute top-[6%] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-blue shadow-[0_0_0_4px_rgb(11_125_255/0.12)]" />
        <span className="absolute top-[48%] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border border-cyan/70 bg-white shadow-[0_0_0_5px_rgb(1_208_252/0.12)]" />
        <span className="absolute top-[90%] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-blue/25 bg-white/70" />
        <span className="absolute top-[28%] left-1/2 h-2 w-3 -translate-x-[2px] rounded-[3px] border border-white/80 bg-white/75" />
        <span className="absolute top-[68%] left-1/2 h-2.5 w-3.5 -translate-x-[4px] rounded-[3px] border border-cyan/25 bg-white/55" />
      </div>
    );
  }

  return (
    <div className="relative w-full" aria-hidden="true">
      <svg viewBox="0 0 1200 148" className="h-auto w-full" fill="none">
        <ellipse
          cx="600"
          cy="58"
          rx="240"
          ry="42"
          fill="url(#company-forward-line-glow)"
        />
        <path
          d="M40 78C170 78 250 52 380 58C520 66 580 42 720 46C860 50 980 36 1160 24"
          stroke="url(#company-forward-line-stroke)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M720 46C870 28 1000 18 1160 10"
          stroke="rgb(11 125 255 / 0.12)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M140 88C280 84 420 70 580 62"
          stroke="rgb(1 208 252 / 0.16)"
          strokeWidth="1"
          strokeLinecap="round"
        />

        <rect
          x="24"
          y="42"
          width="24"
          height="16"
          rx="4"
          fill="rgb(255 255 255 / 0.86)"
          stroke="rgb(11 125 255 / 0.16)"
        />
        <circle cx="88" cy="78" r="5.5" fill="#0b7dff" />
        <circle cx="88" cy="78" r="12" stroke="rgb(11 125 255 / 0.2)" />
        <circle cx="148" cy="68" r="2.2" fill="#01d0fc" opacity="0.55" />

        <rect
          x="536"
          y="24"
          width="52"
          height="32"
          rx="9"
          fill="rgb(255 255 255 / 0.92)"
          stroke="rgb(11 125 255 / 0.22)"
        />
        <rect
          x="596"
          y="32"
          width="36"
          height="22"
          rx="7"
          fill="rgb(255 255 255 / 0.82)"
          stroke="rgb(1 208 252 / 0.3)"
        />
        <rect
          x="640"
          y="38"
          width="26"
          height="16"
          rx="5"
          fill="rgb(255 255 255 / 0.7)"
          stroke="rgb(11 125 255 / 0.16)"
        />
        <circle cx="562" cy="40" r="2.4" fill="#01d0fc" />
        <path
          d="M548 36h24M548 44h14"
          stroke="rgb(11 125 255 / 0.28)"
          strokeWidth="1.15"
          strokeLinecap="round"
        />

        <rect
          x="1004"
          y="8"
          width="32"
          height="22"
          rx="7"
          fill="rgb(255 255 255 / 0.46)"
          stroke="rgb(11 125 255 / 0.14)"
        />
        <rect
          x="1052"
          y="20"
          width="22"
          height="14"
          rx="5"
          fill="rgb(255 255 255 / 0.34)"
          stroke="rgb(1 208 252 / 0.16)"
        />
        <circle cx="1112" cy="18" r="2.3" fill="#0b7dff" opacity="0.38" />
        <circle
          cx="1160"
          cy="24"
          r="8"
          fill="rgb(255 255 255 / 0.38)"
          stroke="rgb(11 125 255 / 0.16)"
        />

        <text
          x="88"
          y="132"
          textAnchor="middle"
          fill="rgb(11 47 99 / 0.38)"
          fontSize="10"
          fontWeight="700"
          letterSpacing="2.2"
        >
          PURPOSE
        </text>
        <text
          x="600"
          y="132"
          textAnchor="middle"
          fill="rgb(11 47 99 / 0.38)"
          fontSize="10"
          fontWeight="700"
          letterSpacing="2.2"
        >
          DIRECTION
        </text>
        <text
          x="1100"
          y="132"
          textAnchor="middle"
          fill="rgb(11 47 99 / 0.38)"
          fontSize="10"
          fontWeight="700"
          letterSpacing="2.2"
        >
          FUTURE
        </text>
        <defs>
          <linearGradient
            id="company-forward-line-stroke"
            x1="40"
            y1="78"
            x2="1160"
            y2="24"
          >
            <stop offset="0%" stopColor="#0b7dff" stopOpacity="0.52" />
            <stop offset="48%" stopColor="#01d0fc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0b7dff" stopOpacity="0.08" />
          </linearGradient>
          <radialGradient
            id="company-forward-line-glow"
            cx="0.5"
            cy="0.5"
            r="0.5"
          >
            <stop offset="0%" stopColor="rgb(1 208 252 / 0.18)" />
            <stop offset="100%" stopColor="rgb(1 208 252 / 0)" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
