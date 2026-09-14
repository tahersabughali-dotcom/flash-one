import { contactInfoCopy, contactInfoItems } from "@/data/contact-info";
import { Container } from "@/components/layout/Container";
import { ContactInformationVisual } from "@/components/contact/ContactInformationVisual";

export function ContactInformation() {
  return (
    <section
      id="contact-information"
      className="relative overflow-hidden bg-page-soft pt-12 pb-12 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16"
    >
      <Container className="relative">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {contactInfoCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.4rem]">
            <span className="block">{contactInfoCopy.title[0]}</span>
            <span className="mt-1 block">{contactInfoCopy.title[1]}</span>
          </h2>
        </div>

        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(14rem,18rem)] lg:gap-12">
          <ul className="grid gap-6 md:grid-cols-2 md:gap-x-8 md:gap-y-7">
            {contactInfoItems.map((item) => (
              <li key={item.label} className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/45">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-1.5 inline-block text-[15px] leading-relaxed text-navy transition-colors hover:text-blue"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
                    {item.value}
                  </p>
                )}
              </li>
            ))}
          </ul>

          <div className="hidden md:block" aria-hidden="true">
            <ContactInformationVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}
