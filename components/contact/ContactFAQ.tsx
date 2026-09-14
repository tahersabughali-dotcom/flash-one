import { contactFaqCopy, contactFaqs } from "@/data/contact-faq";
import { Container } from "@/components/layout/Container";

export function ContactFAQ() {
  return (
    <section
      id="good-to-know"
      className="relative overflow-hidden bg-page pt-12 pb-12 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-page-soft to-transparent"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {contactFaqCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[1.95rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.35rem]">
            <span className="block">{contactFaqCopy.title[0]}</span>
            <span className="mt-1 block">{contactFaqCopy.title[1]}</span>
          </h2>
        </div>

        <dl className="mt-8 grid gap-7 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-8">
          {contactFaqs.map((item) => (
            <div key={item.question} className="min-w-0">
              <dt>
                <h3 className="text-[1.05rem] leading-snug font-extrabold tracking-[-0.025em] text-navy-deep">
                  {item.question}
                </h3>
              </dt>
              <dd className="mt-2 max-w-md text-[14px] leading-relaxed text-muted">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
