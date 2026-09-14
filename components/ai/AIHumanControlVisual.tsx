export function AIHumanControlCore({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div
        className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/70 px-5 py-5 shadow-(--shadow-glass)"
        aria-hidden="true"
      >
        <svg viewBox="0 0 640 92" className="h-auto w-full" fill="none">
          <rect x="8" y="34" width="18" height="12" rx="3" fill="rgb(255 255 255 / 0.8)" stroke="rgb(11 125 255 / 0.16)" />
          <rect x="20" y="50" width="14" height="10" rx="3" fill="rgb(255 255 255 / 0.7)" stroke="rgb(1 208 252 / 0.18)" />
          <path d="M42 48H78" stroke="rgb(11 125 255 / 0.2)" strokeWidth="1.15" />
          <rect x="82" y="28" width="88" height="36" rx="10" fill="rgb(255 255 255 / 0.9)" stroke="rgb(1 208 252 / 0.26)" />
          <path d="M96 42h60M96 52h36" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M180 46H214" stroke="rgb(11 125 255 / 0.18)" strokeWidth="1.1" />
          <rect x="218" y="24" width="70" height="44" rx="12" stroke="rgb(11 125 255 / 0.22)" strokeWidth="1.2" />
          <path d="M232 46h42" stroke="rgb(11 44 99 / 0.22)" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M298 46H330" stroke="rgb(1 208 252 / 0.22)" strokeWidth="1.1" />
          <rect x="334" y="18" width="132" height="56" rx="16" fill="rgb(255 255 255 / 0.96)" stroke="rgb(11 125 255 / 0.28)" />
          <rect x="352" y="34" width="96" height="24" rx="8" stroke="rgb(1 208 252 / 0.34)" />
          <path d="M476 46H512" stroke="rgb(11 125 255 / 0.2)" strokeWidth="1.15" />
          <rect x="516" y="28" width="112" height="36" rx="10" fill="rgb(255 255 255 / 0.92)" stroke="rgb(11 125 255 / 0.2)" />
          <path d="M532 46h80" stroke="rgb(11 125 255 / 0.3)" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-navy/40">
          Human Decision Core
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto flex h-full min-h-[28rem] w-full max-w-[22rem] flex-col justify-center"
      aria-hidden="true"
    >
      <div className="relative flex min-h-[28rem] flex-col overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/76 px-5 py-6 shadow-(--shadow-glass) backdrop-blur-md">
        <div className="pointer-events-none absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgb(1_208_252/0.1),transparent_70%)]" />
        <div className="relative flex flex-1 flex-col items-center justify-between">
          <div className="flex w-full items-center justify-between px-1">
            <span className="h-3.5 w-8 rounded border border-blue/15 bg-white/90" />
            <span className="h-3 w-6 rounded border border-cyan/20 bg-white/80" />
            <span className="size-2 rounded-full bg-blue/30" />
          </div>
          <div className="mt-5 w-[7.5rem] rounded-xl border border-cyan/25 bg-white/90 px-3 py-2.5">
            <span className="block h-1.5 w-full rounded-full bg-blue/15" />
            <span className="mt-1.5 block h-1.5 w-2/3 rounded-full bg-cyan/20" />
          </div>
          <div className="my-5 h-10 w-px bg-linear-to-b from-blue/15 via-cyan/50 to-blue/20" />
          <div className="flex w-[8.5rem] items-center justify-center rounded-2xl border border-navy/15 bg-white/95 px-4 py-3">
            <span className="h-px flex-1 bg-navy/12" />
            <span className="mx-2 size-2 rounded-full border border-cyan/60 bg-white" />
            <span className="h-px flex-1 bg-navy/12" />
          </div>
          <div className="my-5 h-10 w-px bg-linear-to-b from-cyan/40 to-blue/20" />
          <div className="w-full rounded-[1.2rem] border border-blue/25 bg-white px-4 py-5 text-center shadow-(--shadow-glass)">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-navy/40">
              Human
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue/70">
              Decision Core
            </p>
            <div className="mx-auto mt-3 h-8 w-[6.5rem] rounded-lg border border-cyan/30" />
          </div>
          <div className="my-5 h-8 w-px bg-linear-to-b from-blue/20 to-cyan/15" />
          <div className="mb-1 h-9 w-[7rem] rounded-xl border border-blue/15 bg-white/90">
            <span className="mx-auto mt-3 block h-1.5 w-10 rounded-full bg-blue/25" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AIHumanControlField() {
  return (
    <svg
      viewBox="0 0 1000 620"
      className="h-full w-full"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path d="M210 110C300 170 370 210 500 250" stroke="rgb(11 125 255 / 0.14)" strokeWidth="1.1" />
      <path d="M210 280H430" stroke="rgb(11 125 255 / 0.12)" strokeWidth="1.05" />
      <path d="M790 110C700 170 630 210 500 250" stroke="rgb(1 208 252 / 0.16)" strokeWidth="1.1" />
      <path d="M790 280H570" stroke="rgb(1 208 252 / 0.14)" strokeWidth="1.05" />
      <path d="M500 330V470" stroke="rgb(11 125 255 / 0.12)" strokeWidth="1.05" />
    </svg>
  );
}
