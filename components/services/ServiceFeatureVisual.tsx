import type { CatalogueVisual } from "@/data/services-catalogue";

type ServiceFeatureVisualProps = {
  type: CatalogueVisual;
};

export function ServiceFeatureVisual({ type }: ServiceFeatureVisualProps) {
  return (
    <div
      className="relative mx-auto w-full max-w-xl overflow-hidden rounded-(--radius-panel) border border-white/70 bg-white/50 shadow-(--shadow-glass) backdrop-blur-md lg:max-w-none"
      aria-hidden="true"
    >
      <div
        className={[
          "absolute inset-0",
          type === "software" &&
            "bg-[radial-gradient(circle_at_72%_28%,rgb(11_125_255/0.16),transparent_42%)]",
          type === "automation" &&
            "bg-[radial-gradient(circle_at_50%_48%,rgb(1_208_252/0.2),transparent_46%)]",
          type === "consultancy" &&
            "bg-[radial-gradient(circle_at_30%_30%,rgb(11_125_255/0.12),transparent_40%)]",
          type === "services" &&
            "bg-[radial-gradient(circle_at_58%_36%,rgb(11_125_255/0.14),rgb(1_208_252/0.08)_38%,transparent_62%)]",
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <svg viewBox="0 0 520 340" className="relative h-auto w-full" fill="none">
        {type === "software" ? <SoftwareVisual /> : null}
        {type === "automation" ? <AutomationVisual /> : null}
        {type === "consultancy" ? <ConsultancyVisual /> : null}
        {type === "services" ? <ServicesVisual /> : null}
      </svg>
    </div>
  );
}

function SoftwareVisual() {
  return (
    <>
      <rect x="150" y="86" width="88" height="52" rx="14" fill="rgb(255 255 255 / 0.8)" stroke="#0b7dff" strokeWidth="1.5" />
      <rect x="258" y="86" width="112" height="52" rx="14" fill="rgb(231 242 252 / 0.88)" stroke="rgb(1 208 252 / 0.55)" strokeWidth="1.5" />
      <rect x="150" y="158" width="56" height="88" rx="16" fill="rgb(255 255 255 / 0.8)" stroke="rgb(11 125 255 / 0.32)" strokeWidth="1.5" />
      <rect x="226" y="158" width="80" height="88" rx="16" fill="rgb(11 125 255 / 0.12)" stroke="#0b7dff" strokeWidth="1.6" />
      <rect x="326" y="158" width="44" height="40" rx="12" fill="rgb(255 255 255 / 0.86)" stroke="rgb(1 208 252 / 0.5)" strokeWidth="1.4" />
      <rect x="326" y="206" width="44" height="40" rx="12" fill="rgb(255 255 255 / 0.86)" stroke="rgb(11 125 255 / 0.32)" strokeWidth="1.4" />
      <path
        d="M194 138v20M314 138v20M206 202h20M306 178h20M348 198v8"
        stroke="rgb(11 125 255 / 0.35)"
        strokeWidth="1.4"
      />
      <circle cx="238" cy="202" r="4" fill="#01d0fc" />
      <circle cx="266" cy="202" r="4" fill="#0b7dff" />
    </>
  );
}

function AutomationVisual() {
  return (
    <>
      <circle cx="260" cy="170" r="78" stroke="rgb(1 208 252 / 0.22)" strokeWidth="1.2" />
      <circle cx="260" cy="170" r="52" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.4" />
      <circle cx="260" cy="170" r="26" fill="url(#aiCore)" />
      <path
        d="M260 118V78M260 222v40M208 170H168M312 170h40M223 133 196 106M297 207l27 27M223 207 196 234M297 133l27-27"
        stroke="rgb(11 125 255 / 0.32)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="260" cy="78" r="8" fill="white" stroke="#0b7dff" strokeWidth="1.5" />
      <circle cx="260" cy="262" r="8" fill="white" stroke="#01d0fc" strokeWidth="1.5" />
      <circle cx="168" cy="170" r="8" fill="white" stroke="#0b7dff" strokeWidth="1.5" />
      <circle cx="352" cy="170" r="8" fill="white" stroke="#01d0fc" strokeWidth="1.5" />
      <circle cx="196" cy="106" r="7" fill="white" stroke="rgb(11 125 255 / 0.45)" strokeWidth="1.4" />
      <circle cx="324" cy="234" r="7" fill="white" stroke="rgb(1 208 252 / 0.55)" strokeWidth="1.4" />
      <circle cx="196" cy="234" r="7" fill="white" stroke="rgb(11 125 255 / 0.45)" strokeWidth="1.4" />
      <circle cx="324" cy="106" r="7" fill="white" stroke="rgb(1 208 252 / 0.55)" strokeWidth="1.4" />
      <defs>
        <radialGradient id="aiCore" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="42%" stopColor="#8ce8ff" />
          <stop offset="100%" stopColor="#0b7dff" />
        </radialGradient>
      </defs>
    </>
  );
}

function ConsultancyVisual() {
  return (
    <>
      <path
        d="M90 72h340M90 268h340M128 48v244M392 48v244"
        stroke="rgb(11 125 255 / 0.12)"
        strokeWidth="1"
      />
      <rect x="148" y="88" width="224" height="164" rx="18" fill="rgb(255 255 255 / 0.55)" stroke="rgb(11 125 255 / 0.18)" strokeWidth="1.2" />
      <rect x="168" y="108" width="184" height="124" rx="16" fill="rgb(255 255 255 / 0.78)" stroke="rgb(11 125 255 / 0.28)" strokeWidth="1.4" />
      <rect x="186" y="128" width="70" height="84" rx="12" fill="rgb(231 242 252 / 0.95)" stroke="#0b7dff" strokeWidth="1.5" />
      <rect x="266" y="128" width="70" height="38" rx="11" fill="white" stroke="rgb(1 208 252 / 0.5)" strokeWidth="1.4" />
      <rect x="266" y="174" width="70" height="38" rx="11" fill="white" stroke="rgb(11 125 255 / 0.3)" strokeWidth="1.4" />
      <path d="M200 148h42M200 164h28M200 180h36M280 146h42M280 192h36" stroke="rgb(11 125 255 / 0.28)" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function ServicesVisual() {
  return (
    <>
      <ellipse cx="260" cy="168" rx="148" ry="78" fill="rgb(231 242 252 / 0.55)" stroke="rgb(11 125 255 / 0.2)" strokeWidth="1.4" />
      <ellipse cx="260" cy="158" rx="108" ry="50" fill="rgb(255 255 255 / 0.55)" stroke="rgb(1 208 252 / 0.28)" strokeWidth="1.3" />
      <path
        d="M168 150c22-28 64-46 92-46s70 18 92 46M168 186c22 28 64 46 92 46s70-18 92-46"
        stroke="rgb(11 125 255 / 0.22)"
        strokeWidth="1.3"
      />
      <circle cx="196" cy="150" r="9" fill="white" stroke="#0b7dff" strokeWidth="1.5" />
      <circle cx="260" cy="132" r="11" fill="url(#svcCore)" />
      <circle cx="324" cy="150" r="9" fill="white" stroke="#01d0fc" strokeWidth="1.5" />
      <circle cx="214" cy="196" r="8" fill="white" stroke="rgb(11 125 255 / 0.4)" strokeWidth="1.4" />
      <circle cx="306" cy="196" r="8" fill="white" stroke="rgb(1 208 252 / 0.55)" strokeWidth="1.4" />
      <path
        d="M205 156 249 138M271 138l44 18M222 188l32-48M298 188 266 140"
        stroke="rgb(11 125 255 / 0.28)"
        strokeWidth="1.3"
      />
      <defs>
        <radialGradient id="svcCore" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#0b7dff" />
        </radialGradient>
      </defs>
    </>
  );
}
