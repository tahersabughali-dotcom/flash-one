import Image from "next/image";
import Link from "next/link";

export function HomeFinalCta() {
  return (
    <section id="start-a-project" className="relative bg-page pt-2 pb-0 sm:pt-4">
      <div className="relative w-full overflow-hidden max-md:h-[22.5rem]">
        <Image
          src="/brand/cta-artwork.png"
          alt="Let’s Build a Brighter Tomorrow Together"
          width={1983}
          height={793}
          quality={90}
          sizes="100vw"
          className="h-full w-full object-cover object-[center_44%] md:h-auto md:object-contain md:object-center"
        />
        <Link
          href="#start-a-project"
          aria-label="Start a Project"
          className="absolute top-[41.5%] left-[43%] z-10 hidden h-[11%] w-[14%] rounded-full md:block"
        />
      </div>
    </section>
  );
}
