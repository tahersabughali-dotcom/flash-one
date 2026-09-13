import { PublicHeader } from "@/components/layout/PublicHeader";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeServices } from "@/components/home/HomeServices";
import { HomeAI } from "@/components/home/HomeAI";
import { HomeGlobal } from "@/components/home/HomeGlobal";
import { HomeProcess } from "@/components/home/HomeProcess";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function Home() {
  return (
    <>
      <PublicHeader />
      <main>
        <HomeHero />
        <HomeServices />
        <HomeAI />
        <HomeGlobal />
        <HomeProcess />
        <HomeFinalCta />
      </main>
      <PublicFooter />
    </>
  );
}
