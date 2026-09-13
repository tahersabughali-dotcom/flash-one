import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { AIHero } from "@/components/ai/AIHero";
import { AICapabilities } from "@/components/ai/AICapabilities";
import { AIRealWork } from "@/components/ai/AIRealWork";

export const metadata: Metadata = {
  title: "AI | Flash One",
  description:
    "Flash One brings artificial intelligence into practical digital solutions — helping people understand information, simplify work and interact with technology in more useful ways.",
};

export default function AIPage() {
  return (
    <>
      <PublicHeader />
      <main>
        <AIHero />
        <AICapabilities />
        <AIRealWork />
      </main>
      <PublicFooter />
    </>
  );
}
