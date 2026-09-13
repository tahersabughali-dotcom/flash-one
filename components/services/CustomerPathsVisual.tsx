export function CustomerPathsVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[20rem] xl:max-w-[22rem]" aria-hidden="true">
      <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgb(11_125_255/0.18),rgb(1_208_252/0.08)_40%,transparent_70%)]" />
      <svg viewBox="0 0 320 400" className="relative h-auto w-full" fill="none">
        <defs>
          <radialGradient id="pathCore" cx="34%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#7ad8ff" />
            <stop offset="100%" stopColor="#0b7dff" />
          </radialGradient>
        </defs>
        <path d="M48 72C96 128 124 168 160 200" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.3" />
        <path d="M272 72C224 128 196 168 160 200" stroke="rgb(1 208 252 / 0.32)" strokeWidth="1.3" />
        <path d="M48 328C96 272 124 232 160 200" stroke="rgb(11 125 255 / 0.24)" strokeWidth="1.3" />
        <path d="M272 328C224 272 196 232 160 200" stroke="rgb(1 208 252 / 0.28)" strokeWidth="1.3" />
        <circle cx="48" cy="72" r="5" fill="#0b7dff" />
        <circle cx="272" cy="72" r="5" fill="#01d0fc" />
        <circle cx="48" cy="328" r="5" fill="#0b7dff" />
        <circle cx="272" cy="328" r="5" fill="#01d0fc" />
        <text x="160" y="42" textAnchor="middle" fill="rgb(11 44 99 / 0.38)" fontSize="10" fontWeight="700" letterSpacing="2.4">
          YOU
        </text>
        <circle cx="160" cy="200" r="50" fill="rgb(255 255 255 / 0.84)" stroke="rgb(11 125 255 / 0.26)" strokeWidth="1.5" />
        <circle cx="160" cy="200" r="30" fill="url(#pathCore)" />
        <text x="160" y="197" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800" letterSpacing="1.6">
          FLASH
        </text>
        <text x="160" y="208" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800" letterSpacing="1.6">
          ONE
        </text>
        <text x="160" y="368" textAnchor="middle" fill="rgb(11 44 99 / 0.38)" fontSize="10" fontWeight="700" letterSpacing="2.4">
          SOLUTION
        </text>
      </svg>
    </div>
  );
}
