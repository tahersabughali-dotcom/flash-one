import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { CompanyHero } from "@/components/company/CompanyHero";
import { CompanyIdentity } from "@/components/company/CompanyIdentity";
import { CompanyDirection } from "@/components/company/CompanyDirection";
import { CompanyApproach } from "@/components/company/CompanyApproach";
import { CompanyGlobal } from "@/components/company/CompanyGlobal";
import { CompanyPrinciples } from "@/components/company/CompanyPrinciples";
import { CompanyFinalCTA } from "@/components/company/CompanyFinalCTA";

export const metadata: Metadata = {
  title: "Company | Flash One",
  description:
    "Learn about Flash One, a technology company creating software, digital systems, automation and technology solutions for businesses and individuals in the UK and internationally.",
};

export default function CompanyPage() {
  return (
    <>
      <PublicHeader />
      <main>
        <CompanyHero />
        <CompanyIdentity />
        <CompanyDirection />
        <CompanyApproach />
        <CompanyGlobal />
        <CompanyPrinciples />
        <CompanyFinalCTA />
      </main>
      <PublicFooter />
    </>
  );
}
