export function CompanyHeroVisual({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div
        className="relative mx-auto w-full max-w-lg overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/65 px-3 py-4 shadow-(--shadow-glass)"
        aria-hidden="true"
      >
        <svg viewBox="0 0 560 112" className="h-auto w-full" fill="none">
          <rect x="8" y="34" width="86" height="28" rx="9" fill="rgb(255 255 255 / 0.92)" stroke="rgb(11 125 255 / 0.2)" />
          <text x="51" y="52" textAnchor="middle" fill="rgb(11 47 99 / 0.55)" fontSize="9" fontWeight="700" letterSpacing="1.4">
            IDEAS
          </text>
          <rect x="8" y="70" width="86" height="28" rx="9" fill="rgb(255 255 255 / 0.92)" stroke="rgb(1 208 252 / 0.24)" />
          <text x="51" y="88" textAnchor="middle" fill="rgb(11 47 99 / 0.55)" fontSize="9" fontWeight="700" letterSpacing="1.4">
            PEOPLE
          </text>

          <path d="M94 48H168" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.15" />
          <path d="M94 84H168" stroke="rgb(1 208 252 / 0.28)" strokeWidth="1.15" />

          <rect x="168" y="18" width="224" height="76" rx="22" fill="url(#company-core-glow-compact)" stroke="rgb(11 125 255 / 0.22)" />
          <rect x="188" y="32" width="184" height="48" rx="16" fill="rgb(255 255 255 / 0.72)" stroke="rgb(1 208 252 / 0.28)" />
          <rect x="248" y="42" width="28" height="28" rx="8" fill="rgb(255 255 255 / 0.96)" stroke="rgb(11 125 255 / 0.22)" />
          <rect x="284" y="42" width="28" height="28" rx="8" fill="rgb(255 255 255 / 0.96)" stroke="rgb(1 208 252 / 0.28)" />
          <circle cx="280" cy="56" r="3.2" fill="#0b7dff" />

          <path d="M392 48H466" stroke="rgb(1 208 252 / 0.28)" strokeWidth="1.15" />
          <path d="M392 84H466" stroke="rgb(11 125 255 / 0.26)" strokeWidth="1.15" />

          <rect x="466" y="34" width="86" height="28" rx="9" fill="rgb(255 255 255 / 0.92)" stroke="rgb(11 125 255 / 0.2)" />
          <text x="509" y="52" textAnchor="middle" fill="rgb(11 47 99 / 0.55)" fontSize="9" fontWeight="700" letterSpacing="1.2">
            SYSTEMS
          </text>
          <rect x="466" y="70" width="86" height="28" rx="9" fill="rgb(255 255 255 / 0.92)" stroke="rgb(1 208 252 / 0.24)" />
          <text x="509" y="88" textAnchor="middle" fill="rgb(11 47 99 / 0.55)" fontSize="8.5" fontWeight="700" letterSpacing="0.8">
            TECHNOLOGY
          </text>
          <defs>
            <radialGradient id="company-core-glow-compact" cx="50%" cy="50%" r="58%">
              <stop offset="0%" stopColor="rgb(1 208 252 / 0.22)" />
              <stop offset="100%" stopColor="rgb(255 255 255 / 0.4)" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto w-full max-w-[24rem] overflow-hidden sm:max-w-[26rem] lg:max-w-none"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-[6%] rounded-[2.6rem] bg-[radial-gradient(circle_at_50%_48%,rgb(255_255_255/0.98),rgb(1_208_252/0.16)_40%,rgb(11_125_255/0.08)_62%,transparent_76%)]" />

      <svg viewBox="0 0 540 420" className="relative h-auto w-full" fill="none">
        <rect x="214" y="16" width="112" height="36" rx="11" fill="rgb(255 255 255 / 0.94)" stroke="rgb(11 125 255 / 0.22)" />
        <text x="270" y="39" textAnchor="middle" fill="rgb(11 47 99 / 0.58)" fontSize="11" fontWeight="700" letterSpacing="1.8">
          IDEAS
        </text>

        <rect x="16" y="192" width="112" height="36" rx="11" fill="rgb(255 255 255 / 0.94)" stroke="rgb(1 208 252 / 0.26)" />
        <text x="72" y="215" textAnchor="middle" fill="rgb(11 47 99 / 0.58)" fontSize="11" fontWeight="700" letterSpacing="1.8">
          PEOPLE
        </text>

        <rect x="412" y="192" width="112" height="36" rx="11" fill="rgb(255 255 255 / 0.94)" stroke="rgb(11 125 255 / 0.22)" />
        <text x="468" y="215" textAnchor="middle" fill="rgb(11 47 99 / 0.58)" fontSize="11" fontWeight="700" letterSpacing="1.6">
          SYSTEMS
        </text>

        <rect x="198" y="368" width="144" height="36" rx="11" fill="rgb(255 255 255 / 0.94)" stroke="rgb(1 208 252 / 0.26)" />
        <text x="270" y="391" textAnchor="middle" fill="rgb(11 47 99 / 0.58)" fontSize="11" fontWeight="700" letterSpacing="1.4">
          TECHNOLOGY
        </text>

        <path d="M270 52V118" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.25" />
        <path d="M128 210H186" stroke="rgb(1 208 252 / 0.3)" strokeWidth="1.25" />
        <path d="M354 210H412" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.25" />
        <path d="M270 302V368" stroke="rgb(1 208 252 / 0.28)" strokeWidth="1.25" />

        <rect
          x="176"
          y="108"
          width="188"
          height="204"
          rx="40"
          fill="url(#company-core-glow)"
          stroke="rgb(11 125 255 / 0.22)"
          strokeWidth="1.4"
        />
        <rect
          x="196"
          y="128"
          width="148"
          height="164"
          rx="32"
          fill="rgb(255 255 255 / 0.58)"
          stroke="rgb(1 208 252 / 0.32)"
        />
        <rect x="220" y="156" width="46" height="46" rx="12" fill="rgb(255 255 255 / 0.96)" stroke="rgb(11 125 255 / 0.22)" />
        <path d="M230 172h26M230 184h16" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.15" strokeLinecap="round" />
        <rect x="274" y="156" width="46" height="46" rx="12" fill="rgb(255 255 255 / 0.96)" stroke="rgb(1 208 252 / 0.3)" />
        <path d="M284 172h26M284 184h18" stroke="rgb(1 208 252 / 0.36)" strokeWidth="1.15" strokeLinecap="round" />
        <rect x="220" y="210" width="46" height="46" rx="12" fill="rgb(255 255 255 / 0.96)" stroke="rgb(1 208 252 / 0.28)" />
        <path d="M230 226h26M230 238h14" stroke="rgb(11 125 255 / 0.26)" strokeWidth="1.15" strokeLinecap="round" />
        <rect x="274" y="210" width="46" height="46" rx="12" fill="rgb(255 255 255 / 0.96)" stroke="rgb(11 125 255 / 0.22)" />
        <circle cx="297" cy="233" r="6" fill="#0b7dff" />
        <circle cx="270" cy="210" r="4.2" fill="#01d0fc" />
        <defs>
          <radialGradient id="company-core-glow" cx="50%" cy="46%" r="62%">
            <stop offset="0%" stopColor="rgb(1 208 252 / 0.24)" />
            <stop offset="70%" stopColor="rgb(11 125 255 / 0.08)" />
            <stop offset="100%" stopColor="rgb(255 255 255 / 0.2)" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
