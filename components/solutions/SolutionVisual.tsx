import type { SolutionVisualType } from "@/data/core-solutions";

export function SolutionVisual({ type }: { type: SolutionVisualType }) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-[1.25rem] border border-white/70 bg-white/40",
        type === "systems" &&
          "bg-[radial-gradient(circle_at_50%_48%,rgb(11_125_255/0.14),transparent_58%)]",
        type === "transformation" &&
          "bg-[radial-gradient(circle_at_78%_46%,rgb(1_208_252/0.16),transparent_52%)]",
        type === "automation" &&
          "bg-[radial-gradient(circle_at_50%_58%,rgb(11_125_255/0.12),transparent_56%)]",
        type === "platforms" &&
          "bg-[radial-gradient(circle_at_50%_72%,rgb(11_125_255/0.14),rgb(1_208_252/0.08)_40%,transparent_64%)]",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <svg viewBox="0 0 420 220" className="relative h-auto w-full" fill="none">
        {type === "systems" ? <SystemsMark /> : null}
        {type === "transformation" ? <TransformationMark /> : null}
        {type === "automation" ? <AutomationMark /> : null}
        {type === "platforms" ? <PlatformsMark /> : null}
      </svg>
    </div>
  );
}

function SystemsMark() {
  return (
    <>
      <path d="M210 110 132 68" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.3" />
      <path d="M210 110 288 68" stroke="rgb(1 208 252 / 0.3)" strokeWidth="1.3" />
      <path d="M210 110 118 132" stroke="rgb(11 125 255 / 0.24)" strokeWidth="1.3" />
      <path d="M210 110 302 132" stroke="rgb(1 208 252 / 0.26)" strokeWidth="1.3" />
      <path d="M210 110 154 176" stroke="rgb(11 125 255 / 0.22)" strokeWidth="1.3" />
      <path d="M210 110 266 176" stroke="rgb(1 208 252 / 0.24)" strokeWidth="1.3" />
      <circle cx="210" cy="110" r="28" fill="rgb(255 255 255 / 0.86)" stroke="rgb(11 125 255 / 0.22)" />
      <circle cx="210" cy="110" r="12" fill="#0b7dff" />
      <rect x="108" y="48" width="48" height="32" rx="8" fill="rgb(255 255 255 / 0.8)" stroke="rgb(11 125 255 / 0.18)" />
      <rect x="264" y="48" width="48" height="32" rx="8" fill="rgb(255 255 255 / 0.8)" stroke="rgb(1 208 252 / 0.22)" />
      <rect x="86" y="116" width="48" height="32" rx="8" fill="rgb(255 255 255 / 0.8)" stroke="rgb(11 125 255 / 0.18)" />
      <rect x="286" y="116" width="48" height="32" rx="8" fill="rgb(255 255 255 / 0.8)" stroke="rgb(1 208 252 / 0.2)" />
      <rect x="130" y="168" width="48" height="28" rx="8" fill="rgb(255 255 255 / 0.8)" stroke="rgb(11 125 255 / 0.16)" />
      <rect x="242" y="168" width="48" height="28" rx="8" fill="rgb(255 255 255 / 0.8)" stroke="rgb(1 208 252 / 0.18)" />
    </>
  );
}

function TransformationMark() {
  return (
    <>
      <rect x="36" y="48" width="34" height="22" rx="4" fill="rgb(11 44 99 / 0.08)" stroke="rgb(11 44 99 / 0.16)" />
      <rect x="78" y="78" width="28" height="18" rx="4" fill="rgb(11 44 99 / 0.07)" stroke="rgb(11 44 99 / 0.14)" />
      <rect x="48" y="118" width="40" height="20" rx="4" fill="rgb(11 44 99 / 0.08)" stroke="rgb(11 44 99 / 0.15)" />
      <rect x="86" y="156" width="26" height="16" rx="4" fill="rgb(11 44 99 / 0.06)" stroke="rgb(11 44 99 / 0.13)" />
      <path d="M132 110C176 92 208 96 236 110" stroke="rgb(11 125 255 / 0.32)" strokeWidth="1.4" />
      <path d="M128 148C172 136 206 128 240 128" stroke="rgb(1 208 252 / 0.3)" strokeWidth="1.3" />
      <rect x="262" y="52" width="122" height="116" rx="16" fill="rgb(255 255 255 / 0.82)" stroke="rgb(11 125 255 / 0.2)" />
      <path d="M282 78h82M282 98h64M282 118h74M282 138h48" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="236" cy="110" r="5" fill="#01d0fc" />
    </>
  );
}

function AutomationMark() {
  return (
    <>
      <path
        d="M40 150C88 150 104 64 168 64C232 64 248 168 312 168C360 168 376 110 400 96"
        stroke="url(#automationFlow)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="40" cy="150" r="7" fill="#0b7dff" />
      <circle cx="168" cy="64" r="7" fill="#01d0fc" />
      <circle cx="312" cy="168" r="7" fill="#0b7dff" />
      <circle cx="400" cy="96" r="7" fill="#01d0fc" />
      <rect x="148" y="86" width="40" height="24" rx="7" fill="rgb(255 255 255 / 0.8)" stroke="rgb(1 208 252 / 0.22)" />
      <rect x="292" y="126" width="40" height="24" rx="7" fill="rgb(255 255 255 / 0.8)" stroke="rgb(11 125 255 / 0.18)" />
      <path d="M156 98h24M304 138h16" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.2" strokeLinecap="round" />
      <defs>
        <linearGradient id="automationFlow" x1="40" y1="64" x2="400" y2="168">
          <stop offset="0%" stopColor="#0b7dff" stopOpacity="0.45" />
          <stop offset="55%" stopColor="#01d0fc" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0b7dff" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </>
  );
}

function PlatformsMark() {
  return (
    <>
      <rect x="56" y="154" width="308" height="36" rx="12" fill="rgb(255 255 255 / 0.84)" stroke="rgb(11 125 255 / 0.2)" />
      <path d="M78 172h264" stroke="rgb(11 125 255 / 0.18)" strokeWidth="1.2" />
      <path d="M126 154V86" stroke="rgb(11 125 255 / 0.22)" strokeWidth="1.2" />
      <path d="M210 154V48" stroke="rgb(1 208 252 / 0.26)" strokeWidth="1.2" />
      <path d="M294 154V86" stroke="rgb(11 125 255 / 0.22)" strokeWidth="1.2" />
      <rect x="98" y="52" width="56" height="42" rx="10" fill="rgb(255 255 255 / 0.8)" stroke="rgb(11 125 255 / 0.18)" />
      <rect x="176" y="28" width="68" height="50" rx="12" fill="rgb(255 255 255 / 0.86)" stroke="rgb(1 208 252 / 0.24)" />
      <rect x="266" y="52" width="56" height="42" rx="10" fill="rgb(255 255 255 / 0.8)" stroke="rgb(11 125 255 / 0.18)" />
      <path d="M110 68h32M188 46h44M188 60h28M278 68h32" stroke="rgb(11 125 255 / 0.26)" strokeWidth="1.2" strokeLinecap="round" />
    </>
  );
}
