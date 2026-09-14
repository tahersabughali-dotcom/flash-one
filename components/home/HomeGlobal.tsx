import { globalCopy } from "@/data/global";
import { Container } from "@/components/layout/Container";
import { GlobalVisual } from "@/components/home/GlobalVisual";

export function HomeGlobal() {
  return (
    <section id="global" className="relative bg-page-soft pt-4 pb-12 sm:pt-6 sm:pb-14 lg:pb-16">
      <Container>
        <div className="grid items-center gap-6 lg:grid-cols-[15rem_minmax(0,1fr)_14rem] lg:gap-5 xl:grid-cols-[16.5rem_minmax(0,1fr)_15rem] xl:gap-6">
          <div className="max-w-md lg:max-w-none">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
              {globalCopy.eyebrow}
            </p>
            <h2 className="mt-2.5 text-[2.1rem] leading-[0.92] font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.75rem] lg:text-[3.1rem]">
              <span className="block">{globalCopy.title[0]}</span>
              <span className="block">{globalCopy.title[1]}</span>
            </h2>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
              {globalCopy.description}
            </p>
          </div>

          <GlobalVisual />

          <aside className="max-w-sm lg:max-w-none lg:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/45">
              {globalCopy.panelTitle[0]}
            </p>
            <p className="mt-2 text-3xl leading-none font-extrabold tracking-[-0.04em] text-blue sm:text-[2.15rem]">
              {globalCopy.panelTitle[1]}
            </p>
            <p className="mt-1.5 text-3xl leading-none font-extrabold tracking-[-0.04em] text-navy-deep sm:text-[2.15rem]">
              {globalCopy.panelTitle[2]}
            </p>
            <ul className="mt-6 space-y-2.5 text-sm font-semibold text-navy/70 lg:flex lg:flex-col lg:items-end">
              {globalCopy.panelItems.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="size-1.5 rounded-full bg-blue lg:order-2" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Container>
    </section>
  );
}
