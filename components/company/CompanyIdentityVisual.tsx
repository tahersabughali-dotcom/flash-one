export function CompanyIdentityVisual({
  compact = false,
}: {
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div
        className="relative mx-auto w-full max-w-lg overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/65 px-3 py-4 shadow-(--shadow-glass)"
        aria-hidden="true"
      >
        <svg viewBox="0 0 560 96" className="h-auto w-full" fill="none">
          <rect x="16" y="28" width="108" height="40" rx="12" fill="rgb(255 255 255 / 0.78)" stroke="rgb(11 125 255 / 0.16)" />
          <circle cx="36" cy="42" r="2.2" fill="#0b7dff" opacity="0.45" />
          <circle cx="50" cy="54" r="1.8" fill="#01d0fc" opacity="0.5" />
          <rect x="68" y="38" width="16" height="10" rx="3" fill="rgb(255 255 255 / 0.9)" stroke="rgb(11 125 255 / 0.18)" />
          <text x="70" y="78" textAnchor="middle" fill="rgb(11 47 99 / 0.42)" fontSize="8" fontWeight="700" letterSpacing="1.2">
            IDEAS
          </text>

          <path d="M124 48H168" stroke="rgb(11 125 255 / 0.22)" strokeWidth="1.1" />

          <rect x="168" y="24" width="108" height="48" rx="12" fill="rgb(255 255 255 / 0.82)" stroke="rgb(1 208 252 / 0.24)" />
          <circle cx="190" cy="40" r="3" fill="#0b7dff" opacity="0.5" />
          <circle cx="226" cy="48" r="3" fill="#01d0fc" opacity="0.5" />
          <circle cx="252" cy="40" r="3" fill="#0b7dff" opacity="0.45" />
          <path d="M190 40H226 252" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.1" />
          <text x="222" y="84" textAnchor="middle" fill="rgb(11 47 99 / 0.42)" fontSize="8" fontWeight="700" letterSpacing="1.1">
            SYSTEMS
          </text>

          <path d="M276 48H318" stroke="rgb(1 208 252 / 0.24)" strokeWidth="1.1" />

          <rect x="318" y="22" width="108" height="52" rx="12" fill="url(#company-foundation-glow-compact)" stroke="rgb(11 125 255 / 0.22)" />
          <rect x="332" y="34" width="22" height="16" rx="4" fill="rgb(255 255 255 / 0.94)" stroke="rgb(11 125 255 / 0.2)" />
          <rect x="360" y="34" width="22" height="16" rx="4" fill="rgb(255 255 255 / 0.94)" stroke="rgb(1 208 252 / 0.26)" />
          <rect x="388" y="34" width="22" height="16" rx="4" fill="rgb(255 255 255 / 0.94)" stroke="rgb(11 125 255 / 0.2)" />
          <text x="372" y="86" textAnchor="middle" fill="rgb(11 47 99 / 0.42)" fontSize="8" fontWeight="700" letterSpacing="0.8">
            TECHNOLOGY
          </text>

          <path d="M426 48H454" stroke="rgb(11 125 255 / 0.22)" strokeWidth="1.1" />

          <rect x="454" y="20" width="90" height="56" rx="12" fill="rgb(255 255 255 / 0.94)" stroke="rgb(11 125 255 / 0.24)" />
          <path d="M468 38h62M468 48h44M468 58h52" stroke="rgb(11 125 255 / 0.3)" strokeWidth="1.2" strokeLinecap="round" />
          <text x="499" y="88" textAnchor="middle" fill="rgb(11 47 99 / 0.42)" fontSize="8" fontWeight="700" letterSpacing="0.9">
            EXECUTION
          </text>
          <defs>
            <linearGradient id="company-foundation-glow-compact" x1="0" y1="0" x2="1" y2="1">
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
      className="relative mx-auto w-full max-w-[20rem] overflow-hidden sm:max-w-[22rem] xl:max-w-none"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-[8%] rounded-[2.2rem] bg-[radial-gradient(circle_at_50%_58%,rgb(255_255_255/0.95),rgb(1_208_252/0.14)_46%,transparent_74%)]" />

      <svg viewBox="0 0 280 360" className="relative h-auto w-full" fill="none">
        <rect
          x="58"
          y="22"
          width="164"
          height="58"
          rx="16"
          fill="rgb(255 255 255 / 0.62)"
          stroke="rgb(11 125 255 / 0.16)"
        />
        <circle cx="84" cy="44" r="2.4" fill="#0b7dff" opacity="0.45" />
        <circle cx="102" cy="56" r="2" fill="#01d0fc" opacity="0.5" />
        <rect x="128" y="40" width="22" height="12" rx="3.5" fill="rgb(255 255 255 / 0.9)" stroke="rgb(11 125 255 / 0.18)" />
        <rect x="158" y="50" width="16" height="10" rx="3" fill="rgb(255 255 255 / 0.84)" stroke="rgb(1 208 252 / 0.2)" />
        <text x="140" y="92" textAnchor="middle" fill="rgb(11 47 99 / 0.4)" fontSize="9" fontWeight="700" letterSpacing="1.6">
          IDEAS
        </text>

        <path d="M140 80V108" stroke="rgb(11 125 255 / 0.2)" strokeWidth="1.15" />

        <rect
          x="46"
          y="108"
          width="188"
          height="62"
          rx="16"
          fill="rgb(255 255 255 / 0.72)"
          stroke="rgb(1 208 252 / 0.24)"
        />
        <circle cx="78" cy="138" r="3.4" fill="#0b7dff" opacity="0.5" />
        <circle cx="140" cy="132" r="3.4" fill="#01d0fc" opacity="0.55" />
        <circle cx="196" cy="142" r="3.4" fill="#0b7dff" opacity="0.45" />
        <path d="M78 138H140 196" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.15" />
        <path d="M140 132V154" stroke="rgb(1 208 252 / 0.22)" strokeWidth="1.05" />
        <text x="140" y="182" textAnchor="middle" fill="rgb(11 47 99 / 0.4)" fontSize="9" fontWeight="700" letterSpacing="1.4">
          SYSTEMS
        </text>

        <path d="M140 170V196" stroke="rgb(1 208 252 / 0.22)" strokeWidth="1.15" />

        <rect
          x="38"
          y="196"
          width="204"
          height="68"
          rx="16"
          fill="url(#company-foundation-glow)"
          stroke="rgb(11 125 255 / 0.22)"
        />
        <rect x="60" y="214" width="40" height="28" rx="8" fill="rgb(255 255 255 / 0.94)" stroke="rgb(11 125 255 / 0.2)" />
        <rect x="110" y="214" width="40" height="28" rx="8" fill="rgb(255 255 255 / 0.94)" stroke="rgb(1 208 252 / 0.28)" />
        <rect x="160" y="214" width="40" height="28" rx="8" fill="rgb(255 255 255 / 0.94)" stroke="rgb(11 125 255 / 0.2)" />
        <circle cx="230" cy="228" r="4" fill="#0b7dff" />
        <text x="140" y="276" textAnchor="middle" fill="rgb(11 47 99 / 0.4)" fontSize="9" fontWeight="700" letterSpacing="1.1">
          TECHNOLOGY
        </text>

        <path d="M140 264V286" stroke="rgb(11 125 255 / 0.22)" strokeWidth="1.15" />

        <rect
          x="54"
          y="286"
          width="172"
          height="54"
          rx="16"
          fill="rgb(255 255 255 / 0.94)"
          stroke="rgb(11 125 255 / 0.24)"
        />
        <path
          d="M74 306h132M74 318h96M74 330h112"
          stroke="rgb(11 125 255 / 0.3)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <text x="140" y="354" textAnchor="middle" fill="rgb(11 47 99 / 0.4)" fontSize="9" fontWeight="700" letterSpacing="1.2">
          EXECUTION
        </text>
        <defs>
          <linearGradient id="company-foundation-glow" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="rgb(255 255 255 / 0.88)" />
            <stop offset="100%" stopColor="rgb(1 208 252 / 0.18)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
