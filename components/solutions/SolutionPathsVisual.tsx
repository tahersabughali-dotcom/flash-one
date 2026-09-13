import Image from "next/image";

export function SolutionPathsVisual() {
  return (
    <div
      className="relative mx-auto w-full max-w-3xl overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-x-[18%] inset-y-[8%] rounded-full bg-[radial-gradient(circle,rgb(11_125_255/0.14),rgb(1_208_252/0.07)_42%,transparent_70%)]" />

      <svg viewBox="0 0 720 200" className="relative h-auto w-full" fill="none">
        <path
          d="M132 48C196 72 248 88 318 100"
          stroke="rgb(11 125 255 / 0.28)"
          strokeWidth="1.3"
        />
        <path
          d="M588 48C524 72 472 88 402 100"
          stroke="rgb(1 208 252 / 0.3)"
          strokeWidth="1.3"
        />
        <path
          d="M132 152C196 128 248 112 318 100"
          stroke="rgb(11 125 255 / 0.24)"
          strokeWidth="1.3"
        />
        <path
          d="M588 152C524 128 472 112 402 100"
          stroke="rgb(1 208 252 / 0.26)"
          strokeWidth="1.3"
        />

        <circle cx="132" cy="48" r="4.2" fill="#0b7dff" />
        <circle cx="588" cy="48" r="4.2" fill="#01d0fc" />
        <circle cx="132" cy="152" r="4.2" fill="#0b7dff" />
        <circle cx="588" cy="152" r="4.2" fill="#01d0fc" />

        <text
          x="132"
          y="34"
          textAnchor="middle"
          fill="rgb(11 44 99 / 0.38)"
          fontSize="10"
          fontWeight="700"
          letterSpacing="1.8"
        >
          MANUAL
        </text>
        <text
          x="588"
          y="34"
          textAnchor="middle"
          fill="rgb(11 44 99 / 0.38)"
          fontSize="10"
          fontWeight="700"
          letterSpacing="1.8"
        >
          DISCONNECTED
        </text>
        <text
          x="132"
          y="176"
          textAnchor="middle"
          fill="rgb(11 44 99 / 0.38)"
          fontSize="10"
          fontWeight="700"
          letterSpacing="1.8"
        >
          OUTDATED
        </text>
        <text
          x="588"
          y="176"
          textAnchor="middle"
          fill="rgb(11 44 99 / 0.38)"
          fontSize="10"
          fontWeight="700"
          letterSpacing="1.8"
        >
          CUSTOM
        </text>

        <circle
          cx="360"
          cy="100"
          r="46"
          stroke="rgb(255 255 255 / 0.72)"
          strokeWidth="10"
        />
        <circle
          cx="360"
          cy="100"
          r="46"
          stroke="rgb(11 125 255 / 0.18)"
          strokeWidth="1.4"
        />
        <circle
          cx="360"
          cy="100"
          r="30"
          stroke="rgb(1 208 252 / 0.22)"
          strokeWidth="1.2"
        />
      </svg>

      <div className="pointer-events-none absolute top-1/2 left-1/2 flex size-[4.25rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/74 shadow-(--shadow-glass) backdrop-blur-md">
        <Image
          src="/brand/flash-one-logo.png"
          alt=""
          width={210}
          height={140}
          className="h-7 w-auto object-contain"
        />
      </div>
    </div>
  );
}
