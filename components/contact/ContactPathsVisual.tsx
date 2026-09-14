import { contactPathsCopy } from "@/data/contact-paths";

type ContactPathsVisualProps = {
  compact?: boolean;
};

export function ContactPathsVisual({ compact = false }: ContactPathsVisualProps) {
  if (compact) {
    return (
      <div className="relative mx-auto w-full max-w-lg" aria-hidden="true">
        <svg viewBox="0 0 560 72" className="h-auto w-full" fill="none">
          <circle cx="48" cy="28" r="4" fill="#0b7dff" opacity="0.7" />
          <circle cx="156" cy="28" r="4" fill="#01d0fc" opacity="0.7" />
          <circle cx="404" cy="28" r="4" fill="#0b7dff" opacity="0.55" />
          <circle cx="512" cy="28" r="4" fill="#01d0fc" opacity="0.5" />
          <path d="M48 28H156" stroke="rgb(11 125 255 / 0.2)" strokeWidth="1.1" />
          <path d="M156 28H236" stroke="rgb(11 125 255 / 0.18)" strokeWidth="1.1" />
          <path d="M324 28H404" stroke="rgb(1 208 252 / 0.2)" strokeWidth="1.1" />
          <path d="M404 28H512" stroke="rgb(11 125 255 / 0.16)" strokeWidth="1.1" />
          <rect
            x="236"
            y="12"
            width="88"
            height="32"
            rx="16"
            fill="rgb(255 255 255 / 0.92)"
            stroke="rgb(11 125 255 / 0.22)"
          />
          <text
            x="280"
            y="32"
            textAnchor="middle"
            fill="rgb(11 47 99 / 0.5)"
            fontSize="8"
            fontWeight="700"
            letterSpacing="1.1"
          >
            START HERE
          </text>
          <text
            x="280"
            y="62"
            textAnchor="middle"
            fill="rgb(11 47 99 / 0.36)"
            fontSize="8"
            fontWeight="700"
            letterSpacing="1"
          >
            SAME STARTING POINT
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[13.5rem]" aria-hidden="true">
      <div className="pointer-events-none absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.95),rgb(1_208_252/0.14)_52%,transparent_74%)]" />
      <div className="relative rounded-full border border-white/80 bg-white/60 px-5 py-8 text-center shadow-(--shadow-glass) backdrop-blur-md">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/50">
          {contactPathsCopy.center}
        </p>
      </div>
    </div>
  );
}
