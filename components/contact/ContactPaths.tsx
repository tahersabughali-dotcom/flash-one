import { contactPaths, contactPathsCopy } from "@/data/contact-paths";
import { Container } from "@/components/layout/Container";
import { ContactPathsVisual } from "@/components/contact/ContactPathsVisual";

export function ContactPaths() {
  const [project, improve, automation, unsure] = contactPaths;

  return (
    <section
      id="start-conversation"
      className="relative scroll-mt-28 overflow-hidden bg-page-soft pt-12 pb-12 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16"
    >
      <Container className="relative">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
            {contactPathsCopy.eyebrow}
          </p>
          <h2 className="mt-2.5 text-[2.05rem] leading-[0.94] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.5rem] lg:text-[2.75rem]">
            <span className="block">{contactPathsCopy.title[0]}</span>
            <span className="mt-1 block">{contactPathsCopy.title[1]}</span>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {contactPathsCopy.description}
          </p>
        </div>

        <div className="relative mt-10">
          <div className="mb-8 xl:hidden" aria-hidden="true">
            <ContactPathsVisual compact />
          </div>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(11rem,14rem)_minmax(0,1fr)] xl:items-center xl:gap-x-10 xl:gap-y-8">
            <ol className="contents">
              <PathItem
                path={project}
                className="xl:col-start-1 xl:row-start-1"
              />
              <PathItem
                path={improve}
                className="xl:col-start-3 xl:row-start-1"
              />
              <PathItem
                path={automation}
                className="xl:col-start-1 xl:row-start-2"
              />
              <PathItem
                path={unsure}
                className="xl:col-start-3 xl:row-start-2"
              />
            </ol>
            <div
              className="hidden xl:flex xl:col-start-2 xl:row-span-2 xl:items-center xl:justify-center"
              aria-hidden="true"
            >
              <ContactPathsVisual />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function PathItem({
  path,
  className = "",
}: {
  path: (typeof contactPaths)[number];
  className?: string;
}) {
  return (
    <li className={["min-w-0", className].join(" ")}>
      <p className="text-xs font-semibold tracking-[0.18em] text-blue/70">
        {path.number}
        <span className="ml-2 tracking-[0.14em] text-navy/35">{path.name}</span>
      </p>
      <h3 className="mt-1.5 text-[1.22rem] leading-[1.08] font-extrabold tracking-[-0.035em] text-navy-deep sm:text-[1.34rem]">
        <span className="block">{path.title[0]}</span>
        <span className="block text-blue">{path.title[1]}</span>
      </h3>
      <p className="mt-1.5 max-w-sm text-[14px] leading-relaxed text-muted">
        {path.description}
      </p>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/45">
        {path.label}
      </p>
    </li>
  );
}
