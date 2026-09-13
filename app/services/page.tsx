import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ServicesHero } from "@/components/services/ServicesHero";
import { ServicesCatalogue } from "@/components/services/ServicesCatalogue";
import { CustomerPaths } from "@/components/services/CustomerPaths";
import { ServiceJourney } from "@/components/services/ServiceJourney";
import { ServicesFinalCta } from "@/components/services/ServicesFinalCta";

export const metadata: Metadata = {
  title: "Services | Flash One",
  description:
    "From custom software and intelligent automation to technology consulting and digital systems, Flash One turns complex ideas into practical, scalable solutions.",
};

export default function ServicesPage() {
  return (
    <>
      <PublicHeader />
      <main>
        <ServicesHero />
        <ServicesCatalogue />
        <CustomerPaths />
        <ServiceJourney />
        <ServicesFinalCta />
      </main>
      <PublicFooter />
    </>
  );
}
