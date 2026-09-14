import { aiApproachCopy } from "@/data/ai-approach";

export function AIApproachLens({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div
        className="relative mx-auto w-full max-w-lg overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/65 px-4 py-4 shadow-(--shadow-glass)"
        aria-hidden="true"
      >
        <svg viewBox="0 0 560 88" className="h-auto w-full" fill="none">
          <rect x="8" y="28" width="16" height="12" rx="3" fill="rgb(255 255 255 / 0.8)" stroke="rgb(11 125 255 / 0.16)" />
          <rect x="18" y="48" width="12" height="10" rx="3" fill="rgb(255 255 255 / 0.7)" stroke="rgb(1 208 252 / 0.18)" />
          <circle cx="48" cy="36" r="2" fill="#0b7dff" opacity="0.35" />
          <path d="M42 44C78 46 110 46 148 46" stroke="rgb(11 125 255 / 0.2)" strokeWidth="1.1" />
          <ellipse cx="280" cy="44" rx="86" ry="32" fill="rgb(255 255 255 / 0.28)" stroke="rgb(11 125 255 / 0.16)" />
          <ellipse cx="280" cy="44" rx="58" ry="22" fill="rgb(255 255 255 / 0.55)" stroke="rgb(1 208 252 / 0.28)" />
          <ellipse cx="280" cy="44" rx="22" ry="10" fill="rgb(255 255 255 / 0.9)" stroke="rgb(11 125 255 / 0.22)" />
          <circle cx="280" cy="44" r="3.5" fill="#0b7dff" />
          <path d="M368 46C410 46 450 44 492 40" stroke="rgb(1 208 252 / 0.24)" strokeWidth="1.15" />
          <rect x="496" y="24" width="56" height="40" rx="10" fill="rgb(255 255 255 / 0.92)" stroke="rgb(11 125 255 / 0.2)" />
          <path d="M508 38h32M508 48h20" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <p className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-navy/40">
          {aiApproachCopy.lens}
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto flex w-full max-w-[20rem] flex-col items-center"
      aria-hidden="true"
    >
      <div className="relative w-full overflow-hidden rounded-[1.6rem] border border-white/80 bg-white/60 px-4 py-6 shadow-(--shadow-glass) backdrop-blur-md">
        <div className="pointer-events-none absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgb(1_208_252/0.14),transparent_68%)]" />
        <svg viewBox="0 0 220 168" className="relative h-auto w-full" fill="none">
          <rect x="8" y="28" width="22" height="14" rx="3.5" fill="rgb(255 255 255 / 0.8)" stroke="rgb(11 125 255 / 0.16)" />
          <rect x="16" y="50" width="16" height="11" rx="3" fill="rgb(255 255 255 / 0.7)" stroke="rgb(1 208 252 / 0.2)" />
          <circle cx="14" cy="78" r="2" fill="#0b7dff" opacity="0.35" />
          <path d="M36 44C58 56 72 68 86 84" stroke="rgb(11 125 255 / 0.2)" strokeWidth="1.1" />
          <path d="M32 72C54 78 70 86 88 92" stroke="rgb(1 208 252 / 0.18)" strokeWidth="1.05" />
          <ellipse cx="118" cy="86" rx="48" ry="48" stroke="rgb(11 125 255 / 0.12)" />
          <ellipse cx="118" cy="86" rx="34" ry="34" fill="rgb(255 255 255 / 0.38)" stroke="rgb(1 208 252 / 0.26)" />
          <ellipse cx="118" cy="86" rx="18" ry="18" fill="rgb(255 255 255 / 0.86)" stroke="rgb(11 125 255 / 0.22)" />
          <circle cx="118" cy="86" r="4" fill="#0b7dff" />
          <path d="M152 74C172 62 188 50 204 38" stroke="rgb(1 208 252 / 0.22)" strokeWidth="1.1" />
          <path d="M154 96C174 92 190 86 208 78" stroke="rgb(11 125 255 / 0.16)" strokeWidth="1.05" />
          <rect x="176" y="104" width="38" height="28" rx="8" fill="rgb(255 255 255 / 0.92)" stroke="rgb(11 125 255 / 0.2)" />
          <path d="M184 116h22M184 124h14" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.15" strokeLinecap="round" />
        </svg>
        <p className="relative mt-1 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-navy/40">
          {aiApproachCopy.lens}
        </p>
      </div>
    </div>
  );
}
