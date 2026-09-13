import type { ServiceVisualType } from "@/data/services";

type ServiceVisualProps = {
  type: ServiceVisualType;
};

export function ServiceVisual({ type }: ServiceVisualProps) {
  return (
    <div className="service-visual" aria-hidden="true">
      <div className="service-visual-glow" />
      {type === "cube" ? <CubeVisual /> : null}
      {type === "orb" ? <OrbVisual /> : null}
      {type === "blocks" ? <BlocksVisual /> : null}
      {type === "platform" ? <PlatformVisual /> : null}
    </div>
  );
}

function CubeVisual() {
  return (
    <svg viewBox="0 0 120 120" className="service-art">
      <defs>
        <linearGradient id="cube-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B9F1FF" />
          <stop offset="100%" stopColor="#3AA8FF" />
        </linearGradient>
        <linearGradient id="cube-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B86FF" />
          <stop offset="100%" stopColor="#0B4FD6" />
        </linearGradient>
        <linearGradient id="cube-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7AD4FF" />
          <stop offset="100%" stopColor="#1276FF" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="108" rx="34" ry="6" fill="#7EC4FF" opacity="0.28" />
      <path d="M60 12 108 40 60 68 12 40Z" fill="url(#cube-top)" />
      <path d="M12 40 60 68 60 108 12 80Z" fill="url(#cube-left)" />
      <path d="M60 68 108 40 108 80 60 108Z" fill="url(#cube-right)" />
    </svg>
  );
}

function OrbVisual() {
  return (
    <div className="service-orb">
      <span className="service-orb-halo" />
      <span className="service-orb-ring" />
      <span className="service-orb-core" />
    </div>
  );
}

function BlocksVisual() {
  return (
    <svg viewBox="0 0 160 130" className="service-art">
      <defs>
        <linearGradient id="block-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E7F8FF" />
          <stop offset="100%" stopColor="#6EC8FF" />
        </linearGradient>
        <linearGradient id="block-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5AABFF" />
          <stop offset="100%" stopColor="#0D62E8" />
        </linearGradient>
        <linearGradient id="block-c" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9AE6FF" />
          <stop offset="100%" stopColor="#1A86FF" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="118" rx="46" ry="7" fill="#7EC4FF" opacity="0.26" />
      <rect x="52" y="8" width="56" height="34" rx="10" fill="url(#block-a)" />
      <rect x="8" y="42" width="64" height="58" rx="12" fill="url(#block-b)" />
      <rect x="82" y="48" width="70" height="62" rx="12" fill="url(#block-c)" />
    </svg>
  );
}

function PlatformVisual() {
  return (
    <svg viewBox="0 0 160 130" className="service-art">
      <defs>
        <linearGradient id="plat-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F2FBFF" />
          <stop offset="100%" stopColor="#57B7FF" />
        </linearGradient>
        <linearGradient id="plat-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A8DCFF" />
          <stop offset="100%" stopColor="#2D8CFF" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="118" rx="52" ry="7" fill="#7EC4FF" opacity="0.24" />
      <rect x="52" y="6" width="56" height="46" rx="22" fill="url(#plat-top)" />
      <ellipse cx="80" cy="74" rx="58" ry="16" fill="url(#plat-mid)" />
      <ellipse cx="80" cy="96" rx="70" ry="11" fill="#C5E6FF" />
    </svg>
  );
}
