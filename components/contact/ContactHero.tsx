import { contactHeroCopy } from "@/data/contact-hero";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { ContactHeroVisual } from "@/components/contact/ContactHeroVisual";

export function ContactHero() {
  return (
    <section className="relative flex flex-col overflow-hidden pt-24 pb-10 sm:pt-28 sm:pb-12 lg:pt-32 lg:pb-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_36%,rgb(11_125_255/0.11),transparent_32%),radial-gradient(circle_at_16%_72%,rgb(1_208_252/0.09),transparent_28%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-page-soft to-transparent"
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)] lg:gap-12 xl:gap-16">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
              {contactHeroCopy.eyebrow}
            </p>
            <h1 className="mt-3 text-[2.3rem] leading-[0.94] font-extrabold tracking-[-0.045em] text-navy-deep sm:text-[3.05rem] lg:text-[3.35rem]">
              <span className="block">{contactHeroCopy.title[0]}</span>
              <span className="mt-1 block bg-linear-to-r from-blue to-cyan bg-clip-text text-transparent">
                {contactHeroCopy.title[1]}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
              {contactHeroCopy.description}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href={contactHeroCopy.primaryHref} arrow>
                {contactHeroCopy.primaryCta}
              </Button>
              <Button
                href={contactHeroCopy.secondaryHref}
                variant="secondary"
                arrow
              >
                {contactHeroCopy.secondaryCta}
              </Button>
            </div>
            <div className="mt-6 max-w-sm border-l border-cyan/35 pl-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/45">
                {contactHeroCopy.noteEyebrow}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                {contactHeroCopy.note}
              </p>
            </div>
          </div>

          <div className="md:hidden" aria-hidden="true">
            <ContactHeroVisual compact />
          </div>
          <div className="mx-auto hidden w-full md:block" aria-hidden="true">
            <ContactHeroVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}
