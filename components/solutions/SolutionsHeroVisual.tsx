import Image from "next/image";

export function SolutionsHeroVisual() {
  return (
    <div
      className="relative mx-auto w-full max-w-[34rem] overflow-hidden lg:max-w-none"
      aria-hidden="true"
    >
      <div className="absolute inset-[-6%] rounded-full bg-[radial-gradient(circle_at_48%_50%,rgb(11_125_255/0.18),rgb(1_208_252/0.08)_38%,transparent_70%)]" />
      <div className="absolute inset-4 hidden rounded-[2rem] opacity-35 sm:block [background-image:linear-gradient(rgb(11_125_255/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(11_125_255/0.07)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(circle_at_48%_50%,black_24%,transparent_74%)]" />

      <svg viewBox="0 0 540 400" className="relative h-auto w-full" fill="none">
        <g className="max-sm:opacity-0">
          <path
            d="M34 64C86 92 148 148 214 188"
            stroke="rgb(11 125 255 / 0.22)"
            strokeWidth="1.2"
          />
          <path
            d="M22 308C78 278 142 236 214 208"
            stroke="rgb(1 208 252 / 0.2)"
            strokeWidth="1.2"
          />
          <circle cx="34" cy="64" r="3.6" fill="#0b7dff" />
          <circle cx="22" cy="308" r="3.6" fill="#01d0fc" />
        </g>

        <path
          d="M48 118C110 142 164 172 216 194"
          stroke="rgb(11 125 255 / 0.34)"
          strokeWidth="1.35"
        />
        <path
          d="M42 200H208"
          stroke="rgb(1 208 252 / 0.36)"
          strokeWidth="1.35"
        />
        <path
          d="M56 274C112 246 166 224 216 208"
          stroke="rgb(11 125 255 / 0.28)"
          strokeWidth="1.35"
        />

        <circle cx="48" cy="118" r="4.2" fill="#0b7dff" />
        <circle cx="42" cy="200" r="4.2" fill="#01d0fc" />
        <circle cx="56" cy="274" r="4.2" fill="#0b7dff" />

        <circle
          cx="248"
          cy="200"
          r="78"
          stroke="rgb(255 255 255 / 0.7)"
          strokeWidth="12"
        />
        <circle
          cx="248"
          cy="200"
          r="78"
          stroke="rgb(11 125 255 / 0.16)"
          strokeWidth="1.4"
        />
        <circle
          cx="248"
          cy="200"
          r="54"
          stroke="rgb(1 208 252 / 0.24)"
          strokeWidth="1.2"
        />
        <circle
          cx="248"
          cy="200"
          r="34"
          stroke="rgb(11 125 255 / 0.2)"
          strokeWidth="1.1"
        />

        <path
          d="M326 200H392"
          stroke="rgb(1 208 252 / 0.34)"
          strokeWidth="1.35"
        />
        <path
          d="M300 168C338 148 366 132 404 118"
          stroke="rgb(11 125 255 / 0.26)"
          strokeWidth="1.25"
        />
        <path
          d="M300 232C338 252 366 268 404 282"
          stroke="rgb(11 125 255 / 0.24)"
          strokeWidth="1.25"
        />
        <path
          d="M432 118V282"
          stroke="rgb(11 125 255 / 0.14)"
          strokeWidth="1.1"
        />

        <rect
          x="404"
          y="98"
          width="56"
          height="40"
          rx="10"
          fill="rgb(255 255 255 / 0.72)"
          stroke="rgb(11 125 255 / 0.16)"
        />
        <rect
          x="404"
          y="180"
          width="56"
          height="40"
          rx="10"
          fill="rgb(255 255 255 / 0.72)"
          stroke="rgb(1 208 252 / 0.2)"
        />
        <rect
          x="404"
          y="262"
          width="56"
          height="40"
          rx="10"
          fill="rgb(255 255 255 / 0.72)"
          stroke="rgb(11 125 255 / 0.16)"
        />
        <path
          d="M416 114h32M416 122h20"
          stroke="rgb(11 125 255 / 0.28)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M416 196h32M416 204h20"
          stroke="rgb(1 208 252 / 0.32)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M416 278h32M416 286h20"
          stroke="rgb(11 125 255 / 0.28)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>

      <div className="pointer-events-none absolute top-1/2 left-[45.9%] flex size-[4.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/74 shadow-(--shadow-glass) backdrop-blur-md sm:size-[5.25rem]">
        <Image
          src="/brand/flash-one-logo.png"
          alt=""
          width={210}
          height={140}
          className="h-7 w-auto object-contain sm:h-8"
        />
      </div>
    </div>
  );
}
