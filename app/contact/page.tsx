import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactPaths } from "@/components/contact/ContactPaths";
import { ContactBrief } from "@/components/contact/ContactBrief";
import { ContactInformation } from "@/components/contact/ContactInformation";
import { ContactFAQ } from "@/components/contact/ContactFAQ";
import { ContactFinalCTA } from "@/components/contact/ContactFinalCTA";

export const metadata: Metadata = {
  title: "Contact | Flash One",
  description:
    "Contact Flash One to discuss a software project, digital system, automation opportunity, technology requirement or new idea.",
};

export default function ContactPage() {
  return (
    <>
      <PublicHeader />
      <main>
        <ContactHero />
        <ContactPaths />
        <ContactBrief />
        <ContactInformation />
        <ContactFAQ />
        <ContactFinalCTA />
      </main>
      <PublicFooter />
    </>
  );
}
