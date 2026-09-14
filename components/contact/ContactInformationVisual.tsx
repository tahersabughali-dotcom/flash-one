export function ContactInformationVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[20rem]" aria-hidden="true">
      <div className="pointer-events-none absolute inset-[10%] rounded-[1.8rem] bg-[radial-gradient(circle_at_50%_50%,rgb(255_255_255/0.94),rgb(1_208_252/0.1)_52%,transparent_74%)]" />
      <svg viewBox="0 0 280 220" className="relative h-auto w-full" fill="none">
        <rect
          x="28"
          y="28"
          width="224"
          height="164"
          rx="22"
          fill="url(#contact-desk-glow)"
          stroke="rgb(11 125 255 / 0.18)"
        />
        <rect
          x="46"
          y="48"
          width="88"
          height="56"
          rx="12"
          fill="rgb(255 255 255 / 0.92)"
          stroke="rgb(11 125 255 / 0.16)"
        />
        <rect
          x="146"
          y="48"
          width="88"
          height="56"
          rx="12"
          fill="rgb(255 255 255 / 0.86)"
          stroke="rgb(1 208 252 / 0.2)"
        />
        <rect
          x="46"
          y="116"
          width="88"
          height="56"
          rx="12"
          fill="rgb(255 255 255 / 0.86)"
          stroke="rgb(11 125 255 / 0.16)"
        />
        <rect
          x="146"
          y="116"
          width="88"
          height="56"
          rx="12"
          fill="rgb(255 255 255 / 0.78)"
          stroke="rgb(11 125 255 / 0.14)"
        />
        <circle cx="68" cy="68" r="3" fill="#0b7dff" />
        <path d="M80 68h38" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M80 80h24" stroke="rgb(11 125 255 / 0.16)" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="168" cy="68" r="3" fill="#01d0fc" opacity="0.7" />
        <path d="M180 68h38" stroke="rgb(1 208 252 / 0.28)" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="68" cy="136" r="3" fill="#0b7dff" opacity="0.7" />
        <path d="M80 136h38" stroke="rgb(11 125 255 / 0.24)" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="168" cy="136" r="3" fill="#0b7dff" opacity="0.4" />
        <path d="M180 136h28" stroke="rgb(11 125 255 / 0.16)" strokeWidth="1.3" strokeLinecap="round" />
        <defs>
          <linearGradient id="contact-desk-glow" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="rgb(255 255 255 / 0.9)" />
            <stop offset="100%" stopColor="rgb(1 208 252 / 0.12)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
