export function AIFinalCTAVisual({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div
        className="relative mx-auto w-full max-w-lg overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/70 px-3 py-3.5 shadow-(--shadow-glass)"
        aria-hidden="true"
      >
        <svg viewBox="0 0 560 96" className="h-auto w-full" fill="none">
          <rect x="8" y="26" width="22" height="14" rx="3.5" fill="rgb(255 255 255 / 0.92)" stroke="rgb(11 125 255 / 0.22)" />
          <rect x="18" y="50" width="16" height="12" rx="3" fill="rgb(255 255 255 / 0.86)" stroke="rgb(1 208 252 / 0.26)" />
          <circle cx="44" cy="34" r="2.2" fill="#0b7dff" opacity="0.55" />
          <path d="M36 42C72 48 112 50 154 48" stroke="rgb(11 125 255 / 0.32)" strokeWidth="1.2" />

          <path
            d="M164 76V30C164 20 174 14 186 14H374C386 14 396 20 396 30V76"
            fill="rgb(255 255 255 / 0.55)"
            stroke="rgb(11 125 255 / 0.28)"
            strokeWidth="1.4"
          />
          <path
            d="M180 76V36C180 28 188 24 198 24H362C372 24 380 28 380 36V76"
            fill="url(#ai-cta-glow-compact)"
            stroke="rgb(1 208 252 / 0.4)"
            strokeWidth="1.25"
          />
          <ellipse cx="280" cy="50" rx="54" ry="20" fill="rgb(255 255 255 / 0.55)" />
          <ellipse cx="280" cy="50" rx="54" ry="20" stroke="rgb(255 255 255 / 0.85)" strokeWidth="1.15" />
          <circle cx="280" cy="50" r="3.6" fill="#0b7dff" />

          <path d="M400 48H444" stroke="rgb(1 208 252 / 0.36)" strokeWidth="1.2" />
          <rect x="446" y="20" width="102" height="56" rx="11" fill="rgb(255 255 255 / 0.96)" stroke="rgb(11 125 255 / 0.24)" />
          <path d="M458 38h34M458 50h22M500 38h32M500 50h18" stroke="rgb(11 125 255 / 0.3)" strokeWidth="1.2" strokeLinecap="round" />
          <defs>
            <radialGradient id="ai-cta-glow-compact" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgb(1 208 252 / 0.32)" />
              <stop offset="100%" stopColor="rgb(11 125 255 / 0)" />
            </radialGradient>
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
      <div className="pointer-events-none absolute inset-[8%] rounded-[2.4rem] bg-[radial-gradient(circle_at_52%_48%,rgb(255_255_255/0.98),rgb(1_208_252/0.2)_40%,rgb(11_125_255/0.1)_60%,transparent_76%)]" />

      <svg viewBox="0 0 480 320" className="relative h-auto w-full" fill="none">
        <rect x="14" y="52" width="28" height="18" rx="4.5" fill="rgb(255 255 255 / 0.94)" stroke="rgb(11 125 255 / 0.22)" />
        <path d="M20 60h16M20 68h10" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.1" strokeLinecap="round" />
        <rect x="26" y="84" width="20" height="14" rx="4" fill="rgb(255 255 255 / 0.88)" stroke="rgb(1 208 252 / 0.28)" />
        <circle cx="20" cy="126" r="2.8" fill="#0b7dff" opacity="0.55" />
        <circle cx="38" cy="148" r="2.2" fill="#01d0fc" opacity="0.5" />
        <rect x="16" y="176" width="26" height="16" rx="4.5" fill="rgb(255 255 255 / 0.9)" stroke="rgb(11 125 255 / 0.2)" />
        <rect x="28" y="214" width="22" height="14" rx="4" fill="rgb(255 255 255 / 0.84)" stroke="rgb(1 208 252 / 0.24)" />

        <path d="M46 62C82 90 112 122 144 150" stroke="rgb(11 125 255 / 0.32)" strokeWidth="1.25" />
        <path d="M50 126H142" stroke="rgb(1 208 252 / 0.32)" strokeWidth="1.2" />
        <path d="M46 222C84 196 114 176 146 164" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.2" />

        <path
          d="M152 252V82C152 56 172 40 198 40H282C308 40 328 56 328 82V252"
          fill="rgb(255 255 255 / 0.62)"
          stroke="rgb(11 125 255 / 0.28)"
          strokeWidth="1.45"
        />
        <path
          d="M170 252V94C170 74 186 62 206 62H274C294 62 310 74 310 94V252"
          fill="url(#ai-cta-glow-full)"
          stroke="rgb(1 208 252 / 0.42)"
          strokeWidth="1.3"
        />
        <path d="M152 40h14M328 40h-14M152 252h14M328 252h-14" stroke="rgb(11 125 255 / 0.34)" strokeWidth="1.3" strokeLinecap="round" />
        <ellipse cx="240" cy="152" rx="38" ry="54" fill="rgb(255 255 255 / 0.42)" stroke="rgb(255 255 255 / 0.9)" strokeWidth="1.2" />
        <ellipse cx="240" cy="152" rx="20" ry="28" fill="rgb(255 255 255 / 0.92)" stroke="rgb(11 125 255 / 0.22)" />
        <circle cx="240" cy="152" r="4" fill="#0b7dff" />

        <path d="M328 128C356 122 378 114 400 102" stroke="rgb(1 208 252 / 0.34)" strokeWidth="1.2" />
        <path d="M328 152H400" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.2" />
        <path d="M328 176C356 182 378 190 400 202" stroke="rgb(1 208 252 / 0.3)" strokeWidth="1.2" />

        <rect x="400" y="82" width="66" height="38" rx="10" fill="rgb(255 255 255 / 0.97)" stroke="rgb(11 125 255 / 0.24)" />
        <path d="M410 96h30M410 106h18" stroke="rgb(11 125 255 / 0.3)" strokeWidth="1.15" strokeLinecap="round" />
        <rect x="400" y="132" width="66" height="38" rx="10" fill="rgb(255 255 255 / 0.97)" stroke="rgb(1 208 252 / 0.34)" />
        <path d="M410 146h30M410 156h22" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.15" strokeLinecap="round" />
        <rect x="400" y="182" width="48" height="28" rx="9" fill="rgb(255 255 255 / 0.94)" stroke="rgb(11 125 255 / 0.2)" />
        <path d="M410 196h22" stroke="rgb(1 208 252 / 0.36)" strokeWidth="1.15" strokeLinecap="round" />
        <defs>
          <radialGradient id="ai-cta-glow-full" cx="50%" cy="46%" r="58%">
            <stop offset="0%" stopColor="rgb(1 208 252 / 0.28)" />
            <stop offset="70%" stopColor="rgb(11 125 255 / 0.08)" />
            <stop offset="100%" stopColor="rgb(255 255 255 / 0)" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
