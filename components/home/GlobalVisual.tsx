import Image from "next/image";

export function GlobalVisual() {
  return (
    <div className="relative w-full" aria-hidden="true">
      <Image
        src="/brand/global-artwork.png"
        alt=""
        width={1768}
        height={890}
        sizes="(min-width: 1024px) 48vw, 92vw"
        className="h-auto w-full object-contain object-center"
      />
    </div>
  );
}
