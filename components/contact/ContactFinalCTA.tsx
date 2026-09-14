import { contactCtaCopy } from "@/data/contact-faq";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { ContactFinalCTAVisual } from "@/components/contact/ContactFinalCTAVisual";

export function ContactFinalCTA() {
  return (
    <section
      id="contact-cta"
      className="relative overflow-hidden bg-page-soft pt-12 pb-12 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_48%,rgb(11_125_255/0.1),transparent_34%),radial-gradient(circle_at_18%_72%,rgb(1_208_252/0.08),transparent_28%)]"
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(14rem,18rem)] lg:gap-12">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
              {contactCtaCopy.eyebrow}
            </p>
            <h2 className="mt-2.5 text-[2.05rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.65rem] lg:text-[2.9rem]">
              <span className="block">{contactCtaCopy.title[0]}</span>
              <span className="mt-1 block bg-linear-to-r from-blue to-cyan bg-clip-text text-transparent">
                {contactCtaCopy.title[1]}
              </span>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
              {contactCtaCopy.description}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href={contactCtaCopy.primaryHref} arrow>
                {contactCtaCopy.primaryCta}
              </Button>
              <Button
                href={contactCtaCopy.secondaryHref}
                variant="secondary"
                arrow
              >
                {contactCtaCopy.secondaryCta}
              </Button>
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-navy/45">
              {contactCtaCopy.note}
            </p>
          </div>

          <div className="md:hidden" aria-hidden="true">
            <ContactFinalCTAVisual compact />
          </div>
          <div
            className="mx-auto hidden w-full max-w-[18rem] md:block lg:max-w-none"
            aria-hidden="true"
          >
            <ContactFinalCTAVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}
