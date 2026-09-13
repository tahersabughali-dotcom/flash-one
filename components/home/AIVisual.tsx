import Image from "next/image";

export function AIVisual() {
  return (
    <div className="relative w-full max-w-[22rem] md:max-w-[24rem] lg:max-w-none" aria-hidden="true">
      <Image
        src="/brand/ai-artwork.png"
        alt=""
        width={1536}
        height={1024}
        sizes="(min-width: 1024px) 28vw, 80vw"
        className="h-auto w-full object-contain"
      />
    </div>
  );
}
