import Image from "next/image";

export function ServicesFinalCtaVisual() {
  return (
    <div
      className="relative mx-auto aspect-[5/4] w-full max-w-[18rem] overflow-hidden sm:max-w-[20rem] lg:max-w-none lg:max-h-[19rem]"
      aria-hidden="true"
    >
      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgb(1_208_252/0.22),rgb(11_125_255/0.1)_42%,transparent_70%)]" />
      <div className="absolute inset-6 hidden rounded-[2rem] opacity-40 sm:block [background-image:linear-gradient(rgb(11_125_255/0.08)_1px,transparent_1px),linear-gradient(90deg,rgb(11_125_255/0.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(circle_at_58%_50%,black_28%,transparent_76%)]" />

      <svg viewBox="0 0 440 352" className="relative h-full w-full" fill="none">
        <ellipse
          cx="252"
          cy="176"
          rx="118"
          ry="118"
          stroke="rgb(255 255 255 / 0.72)"
          strokeWidth="10"
        />
        <ellipse
          cx="252"
          cy="176"
          rx="118"
          ry="118"
          stroke="rgb(11 125 255 / 0.16)"
          strokeWidth="1.4"
        />
        <ellipse
          cx="252"
          cy="176"
          rx="86"
          ry="86"
          stroke="rgb(1 208 252 / 0.22)"
          strokeWidth="1.2"
        />
        <ellipse
          cx="252"
          cy="176"
          rx="58"
          ry="58"
          stroke="rgb(11 125 255 / 0.2)"
          strokeWidth="1.1"
        />

        <path
          d="M28 88C86 104 148 128 196 162"
          stroke="rgb(11 125 255 / 0.32)"
          strokeWidth="1.35"
        />
        <path
          d="M22 176H194"
          stroke="rgb(1 208 252 / 0.34)"
          strokeWidth="1.35"
        />
        <path
          d="M34 268C92 246 150 216 196 190"
          stroke="rgb(11 125 255 / 0.26)"
          strokeWidth="1.35"
        />
        <path
          d="M252 42V118"
          stroke="rgb(1 208 252 / 0.2)"
          strokeWidth="1.2"
        />
        <path
          d="M252 234V310"
          stroke="rgb(11 125 255 / 0.18)"
          strokeWidth="1.2"
        />
        <path
          d="M386 92C348 118 312 146 292 164"
          stroke="rgb(1 208 252 / 0.2)"
          strokeWidth="1.15"
        />
        <path
          d="M392 256C352 230 318 204 292 188"
          stroke="rgb(11 125 255 / 0.18)"
          strokeWidth="1.15"
        />

        <circle cx="28" cy="88" r="4.2" fill="#0b7dff" />
        <circle cx="22" cy="176" r="4.2" fill="#01d0fc" />
        <circle cx="34" cy="268" r="4.2" fill="#0b7dff" />
        <circle cx="252" cy="42" r="3.4" fill="#01d0fc" />
        <circle cx="252" cy="310" r="3.4" fill="#0b7dff" />
        <circle cx="386" cy="92" r="3.4" fill="#01d0fc" />
        <circle cx="392" cy="256" r="3.4" fill="#0b7dff" />
      </svg>

      <div className="pointer-events-none absolute top-1/2 left-[57.3%] flex size-[5.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/72 shadow-(--shadow-glass) backdrop-blur-md sm:size-[6.25rem]">
        <Image
          src="/brand/flash-one-logo.png"
          alt=""
          width={210}
          height={140}
          className="h-8 w-auto object-contain sm:h-9"
        />
      </div>
    </div>
  );
}
