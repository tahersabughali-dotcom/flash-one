import { contactBriefCopy, contactBriefPoints } from "@/data/contact-brief";
import { Container } from "@/components/layout/Container";
import { ContactBriefVisual } from "@/components/contact/ContactBriefVisual";

export function ContactBrief() {
  return (
    <section
      id="keep-it-simple"
      className="relative overflow-hidden bg-page pt-12 pb-12 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-page-soft to-transparent"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,20rem)] lg:gap-12">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
              {contactBriefCopy.eyebrow}
            </p>
            <h2 className="mt-2.5 text-[2.05rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.5rem] lg:text-[2.7rem]">
              <span className="block">{contactBriefCopy.title[0]}</span>
              <span className="mt-1 block">{contactBriefCopy.title[1]}</span>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
              {contactBriefCopy.description}
            </p>
            <ol className="mt-7 max-w-lg space-y-3">
              {contactBriefPoints.map((point, index) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-0.5 w-6 shrink-0 text-xs font-semibold tracking-[0.16em] text-blue/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[15px] leading-relaxed text-navy">
                    {point}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="md:hidden" aria-hidden="true">
            <ContactBriefVisual compact />
          </div>
          <div className="mx-auto hidden w-full max-w-[20rem] md:block" aria-hidden="true">
            <ContactBriefVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}
