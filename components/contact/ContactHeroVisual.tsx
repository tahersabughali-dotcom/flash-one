type ContactHeroVisualProps = {
  compact?: boolean;
};

export function ContactHeroVisual({ compact = false }: ContactHeroVisualProps) {
  if (compact) {
    return (
      <div
        className="relative mx-auto w-full max-w-lg overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/65 px-3 py-3.5 shadow-(--shadow-glass)"
        aria-hidden="true"
      >
        <svg viewBox="0 0 560 92" className="h-auto w-full" fill="none">
          <circle cx="36" cy="40" r="4" fill="#0b7dff" />
          <circle cx="36" cy="40" r="9" stroke="rgb(11 125 255 / 0.2)" />
          <text
            x="36"
            y="72"
            textAnchor="middle"
            fill="rgb(11 47 99 / 0.4)"
            fontSize="8"
            fontWeight="700"
            letterSpacing="1.2"
          >
            IDEA
          </text>
          <path
            d="M48 40C92 40 120 40 164 40"
            stroke="rgb(11 125 255 / 0.28)"
            strokeWidth="1.2"
          />
          <rect
            x="164"
            y="16"
            width="168"
            height="48"
            rx="24"
            fill="url(#contact-open-channel-glow-compact)"
            stroke="rgb(11 125 255 / 0.22)"
          />
          <circle cx="248" cy="40" r="3.2" fill="#0b7dff" />
          <text
            x="248"
            y="80"
            textAnchor="middle"
            fill="rgb(11 47 99 / 0.4)"
            fontSize="8"
            fontWeight="700"
            letterSpacing="0.8"
          >
            CONVERSATION
          </text>
          <path
            d="M332 40C372 32 404 24 436 18"
            stroke="rgb(1 208 252 / 0.28)"
            strokeWidth="1.15"
          />
          <path d="M332 40H436" stroke="rgb(11 125 255 / 0.18)" strokeWidth="1.1" />
          <path
            d="M332 40C372 48 404 56 436 62"
            stroke="rgb(11 125 255 / 0.2)"
            strokeWidth="1.15"
          />
          <circle cx="448" cy="18" r="3" fill="#01d0fc" opacity="0.7" />
          <circle cx="448" cy="40" r="3.4" fill="#0b7dff" />
          <circle cx="448" cy="62" r="3" fill="#0b7dff" opacity="0.45" />
          <text
            x="508"
            y="44"
            textAnchor="middle"
            fill="rgb(11 47 99 / 0.4)"
            fontSize="8"
            fontWeight="700"
            letterSpacing="0.8"
          >
            NEXT STEP
          </text>
          <defs>
            <linearGradient
              id="contact-open-channel-glow-compact"
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
      className="relative mx-auto w-full max-w-[22rem] overflow-hidden sm:max-w-[24rem] lg:max-w-none"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-[10%] rounded-[2.4rem] bg-[radial-gradient(circle_at_52%_48%,rgb(255_255_255/0.96),rgb(1_208_252/0.14)_46%,transparent_74%)]" />
      <svg viewBox="0 0 360 300" className="relative h-auto w-full" fill="none">
        <rect
          x="28"
          y="34"
          width="22"
          height="14"
          rx="4"
          fill="rgb(255 255 255 / 0.86)"
          stroke="rgb(11 125 255 / 0.16)"
        />
        <circle cx="52" cy="78" r="5.5" fill="#0b7dff" />
        <circle cx="52" cy="78" r="12" stroke="rgb(11 125 255 / 0.2)" />
        <text
          x="52"
          y="114"
          textAnchor="middle"
          fill="rgb(11 47 99 / 0.38)"
          fontSize="9"
          fontWeight="700"
          letterSpacing="1.6"
        >
          IDEA
        </text>

        <path
          d="M64 78C98 78 118 118 140 148"
          stroke="rgb(11 125 255 / 0.28)"
          strokeWidth="1.3"
        />

        <rect
          x="96"
          y="128"
          width="168"
          height="72"
          rx="36"
          fill="url(#contact-open-channel-glow)"
          stroke="rgb(11 125 255 / 0.22)"
        />
        <circle cx="180" cy="164" r="4" fill="#0b7dff" />
        <path
          d="M128 164h36M196 164h36"
          stroke="rgb(11 125 255 / 0.22)"
          strokeWidth="1.15"
        />
        <text
          x="180"
          y="220"
          textAnchor="middle"
          fill="rgb(11 47 99 / 0.38)"
          fontSize="9"
          fontWeight="700"
          letterSpacing="1.3"
        >
          CONVERSATION
        </text>

        <path
          d="M180 200V226"
          stroke="rgb(1 208 252 / 0.28)"
          strokeWidth="1.2"
        />
        <circle cx="180" cy="234" r="3.2" fill="#01d0fc" />
        <text
          x="180"
          y="256"
          textAnchor="middle"
          fill="rgb(11 47 99 / 0.38)"
          fontSize="9"
          fontWeight="700"
          letterSpacing="1.4"
        >
          CLARITY
        </text>

        <path
          d="M264 164C292 148 312 128 328 108"
          stroke="rgb(1 208 252 / 0.22)"
          strokeWidth="1.15"
        />
        <path d="M264 164H328" stroke="rgb(11 125 255 / 0.18)" strokeWidth="1.1" />
        <path
          d="M264 164C292 180 312 200 328 220"
          stroke="rgb(11 125 255 / 0.18)"
          strokeWidth="1.15"
        />
        <rect
          x="328"
          y="92"
          width="22"
          height="16"
          rx="5"
          fill="rgb(255 255 255 / 0.78)"
          stroke="rgb(11 125 255 / 0.16)"
        />
        <rect
          x="328"
          y="154"
          width="22"
          height="16"
          rx="5"
          fill="rgb(255 255 255 / 0.9)"
          stroke="rgb(1 208 252 / 0.24)"
        />
        <rect
          x="328"
          y="212"
          width="20"
          height="14"
          rx="5"
          fill="rgb(255 255 255 / 0.7)"
          stroke="rgb(11 125 255 / 0.14)"
        />
        <text
          x="300"
          y="286"
          textAnchor="middle"
          fill="rgb(11 47 99 / 0.38)"
          fontSize="9"
          fontWeight="700"
          letterSpacing="1.1"
        >
          NEXT STEP
        </text>
        <defs>
          <linearGradient
            id="contact-open-channel-glow"
            x1="0.15"
            y1="0"
            x2="0.9"
            y2="1"
          >
            <stop offset="0%" stopColor="rgb(255 255 255 / 0.92)" />
            <stop offset="100%" stopColor="rgb(1 208 252 / 0.18)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
