import type { AICapabilityIcon } from "@/data/ai-capabilities";

export function AICapabilityMark({ type }: { type: AICapabilityIcon }) {
  const className = "h-auto w-full";

  if (type === "understand") {
    return (
      <svg viewBox="0 0 176 72" className={className} fill="none" aria-hidden="true">
        <rect x="6" y="16" width="20" height="14" rx="3.5" fill="rgb(255 255 255 / 0.8)" stroke="rgb(11 125 255 / 0.22)" />
        <rect x="20" y="40" width="16" height="11" rx="3" fill="rgb(255 255 255 / 0.7)" stroke="rgb(1 208 252 / 0.24)" />
        <rect x="4" y="50" width="12" height="8" rx="2.5" fill="rgb(255 255 255 / 0.62)" stroke="rgb(11 125 255 / 0.16)" />
        <circle cx="40" cy="18" r="2.2" fill="#0b7dff" opacity="0.45" />
        <circle cx="10" cy="36" r="1.8" fill="#01d0fc" opacity="0.4" />
        <path d="M34 26C52 31 68 34 86 36" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.2" />
        <rect x="88" y="14" width="80" height="44" rx="12" fill="rgb(255 255 255 / 0.9)" stroke="rgb(11 125 255 / 0.2)" />
        <path d="M102 28h52M102 38h40M102 48h26" stroke="rgb(11 125 255 / 0.34)" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "assist") {
    return (
      <svg viewBox="0 0 160 72" className={className} fill="none" aria-hidden="true">
        <rect x="8" y="20" width="54" height="34" rx="9" fill="rgb(255 255 255 / 0.76)" stroke="rgb(11 125 255 / 0.16)" />
        <path d="M20 32h30M20 42h18" stroke="rgb(11 44 99 / 0.2)" strokeWidth="1.3" strokeLinecap="round" />
        <rect x="74" y="12" width="78" height="48" rx="14" fill="rgb(255 255 255 / 0.92)" stroke="rgb(1 208 252 / 0.34)" />
        <circle cx="94" cy="36" r="6" fill="#01d0fc" opacity="0.72" />
        <path d="M108 30h30M108 42h18" stroke="rgb(11 125 255 / 0.36)" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "automate") {
    return (
      <svg viewBox="0 0 168 72" className={className} fill="none" aria-hidden="true">
        <circle cx="16" cy="28" r="4.5" fill="#0b7dff" opacity="0.2" />
        <circle cx="16" cy="46" r="4.5" fill="#0b7dff" opacity="0.2" />
        <circle cx="34" cy="28" r="4.5" fill="#0b7dff" opacity="0.2" />
        <circle cx="34" cy="46" r="4.5" fill="#0b7dff" opacity="0.2" />
        <path d="M46 36H68" stroke="rgb(1 208 252 / 0.34)" strokeWidth="1.3" />
        <circle cx="86" cy="36" r="6" fill="#0b7dff" />
        <circle cx="114" cy="36" r="6" fill="#01d0fc" />
        <circle cx="142" cy="36" r="6" fill="#0b7dff" />
        <path d="M92 36h16M120 36h16" stroke="rgb(255 255 255 / 0.92)" strokeWidth="1.4" />
      </svg>
    );
  }

  if (type === "connect") {
    return (
      <svg viewBox="0 0 168 72" className={className} fill="none" aria-hidden="true">
        <circle cx="18" cy="20" r="5.5" stroke="rgb(11 125 255 / 0.4)" strokeWidth="1.35" />
        <circle cx="24" cy="54" r="5.5" stroke="rgb(1 208 252 / 0.4)" strokeWidth="1.35" />
        <circle cx="52" cy="36" r="5.5" stroke="rgb(11 125 255 / 0.32)" strokeWidth="1.35" />
        <path d="M23 24C32 28 40 32 46 36M30 52C38 46 44 40 47 38" stroke="rgb(11 125 255 / 0.24)" strokeWidth="1.15" />
        <circle cx="118" cy="36" r="18" fill="rgb(255 255 255 / 0.84)" stroke="rgb(1 208 252 / 0.3)" />
        <circle cx="118" cy="36" r="5" fill="#0b7dff" />
        <path d="M58 36H100" stroke="rgb(1 208 252 / 0.32)" strokeWidth="1.25" />
        <circle cx="150" cy="22" r="4" stroke="rgb(11 125 255 / 0.22)" />
        <circle cx="152" cy="52" r="4" stroke="rgb(1 208 252 / 0.22)" />
        <path d="M134 28C140 26 144 24 146 22M136 44C142 46 146 50 148 52" stroke="rgb(11 125 255 / 0.18)" strokeWidth="1.1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 72" className={className} fill="none" aria-hidden="true">
      <path d="M10 52 28 36 44 44 64 22" stroke="rgb(11 125 255 / 0.22)" strokeWidth="1.3" />
      <circle cx="10" cy="52" r="2.3" fill="#0b7dff" opacity="0.35" />
      <circle cx="28" cy="36" r="2.3" fill="#01d0fc" opacity="0.35" />
      <circle cx="44" cy="44" r="2.3" fill="#0b7dff" opacity="0.35" />
      <circle cx="64" cy="22" r="2.3" fill="#01d0fc" opacity="0.4" />
      <path d="M70 36H86" stroke="rgb(1 208 252 / 0.32)" strokeWidth="1.2" />
      <rect x="90" y="14" width="62" height="44" rx="12" fill="rgb(255 255 255 / 0.92)" stroke="rgb(11 125 255 / 0.22)" />
      <path d="M104 42 116 30 128 36 138 24" stroke="rgb(1 208 252 / 0.52)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="162" y="20" width="30" height="32" rx="9" stroke="rgb(11 44 99 / 0.18)" strokeWidth="1.2" />
      <path d="M170 36h14" stroke="rgb(11 44 99 / 0.16)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function AICapabilitiesLayer() {
  return (
    <div
      className="relative mx-auto flex w-full max-w-3xl flex-col items-center justify-center"
      aria-hidden="true"
    >
      <svg viewBox="0 0 720 92" className="h-auto w-full" fill="none">
        <rect
          x="48"
          y="16"
          width="624"
          height="60"
          rx="22"
          fill="rgb(255 255 255 / 0.3)"
          stroke="rgb(11 125 255 / 0.1)"
        />
        <rect
          x="78"
          y="24"
          width="564"
          height="44"
          rx="16"
          fill="rgb(255 255 255 / 0.55)"
          stroke="rgb(1 208 252 / 0.2)"
        />
        <rect
          x="118"
          y="30"
          width="484"
          height="32"
          rx="12"
          fill="rgb(255 255 255 / 0.86)"
          stroke="rgb(11 125 255 / 0.16)"
        />
        <rect x="16" y="28" width="12" height="9" rx="2" fill="rgb(255 255 255 / 0.7)" stroke="rgb(11 125 255 / 0.2)" />
        <rect x="24" y="46" width="10" height="8" rx="2" fill="rgb(255 255 255 / 0.6)" stroke="rgb(1 208 252 / 0.2)" />
        <circle cx="18" cy="62" r="2" fill="#0b7dff" opacity="0.35" />
        <path
          d="M250 46h18M274 46h18M298 46h18"
          stroke="rgb(11 125 255 / 0.28)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <rect
          x="680"
          y="30"
          width="28"
          height="32"
          rx="8"
          fill="rgb(255 255 255 / 0.88)"
          stroke="rgb(1 208 252 / 0.28)"
        />
        <path d="M687 46h14" stroke="rgb(11 125 255 / 0.35)" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/40">
        Intelligence Layer
      </p>
    </div>
  );
}

export function AICapabilitiesField() {
  return (
    <svg
      viewBox="0 0 1000 680"
      className="h-full w-full"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M210 90C290 170 360 210 500 250"
        stroke="rgb(11 125 255 / 0.16)"
        strokeWidth="1.15"
      />
      <path
        d="M790 90C710 170 640 210 500 250"
        stroke="rgb(1 208 252 / 0.18)"
        strokeWidth="1.15"
      />
      <path
        d="M210 390C290 330 360 290 500 260"
        stroke="rgb(11 125 255 / 0.14)"
        strokeWidth="1.1"
      />
      <path
        d="M790 390C710 330 640 290 500 260"
        stroke="rgb(1 208 252 / 0.16)"
        strokeWidth="1.1"
      />
      <path
        d="M500 270V430"
        stroke="rgb(11 125 255 / 0.12)"
        strokeWidth="1.05"
      />
    </svg>
  );
}
