import Image from "next/image";

export function HeroVisual() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <Image
        src="/brand/hero-artwork.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="origin-center object-cover object-[center_48%] md:object-[36%_50%] lg:object-[32%_48%]"
      />
      <div className="hero-edge-blend absolute inset-0" />
    </div>
  );
}
