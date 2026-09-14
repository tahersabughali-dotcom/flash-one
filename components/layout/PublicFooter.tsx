import Image from "next/image";
import Link from "next/link";
import { footerColumns, footerCopy } from "@/data/footer";
import { Container } from "@/components/layout/Container";

export function PublicFooter() {
  return (
    <footer className="border-t border-line bg-page-soft">
      <Container className="pt-12 pb-6 sm:pt-14 sm:pb-7">
        <div className="grid gap-10 lg:grid-cols-[13.5rem_minmax(0,1fr)_10.5rem] lg:items-start lg:gap-8 xl:gap-12">
          <Link href="/" aria-label="Flash One" className="inline-flex w-fit">
            <Image
              src="/brand/flash-one-logo.png"
              alt="Flash One"
              width={210}
              height={140}
              className="h-11 w-auto object-contain sm:h-12"
            />
          </Link>

          <nav aria-label="Footer">
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-x-8">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/45">
                    {column.title}
                  </p>
                  <ul className="mt-3.5 space-y-2.5">
                    {column.links.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="text-[13px] leading-snug text-navy/70 transition-colors hover:text-navy"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          <aside className="flex flex-col lg:items-end lg:text-right">
            <div>
              {footerCopy.brandLines.map((line) => (
                <p
                  key={line}
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/40"
                >
                  {line}
                </p>
              ))}
              <div className="mt-4">
                {footerCopy.nextLines.map((line) => (
                  <p
                    key={line}
                    className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/55"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10 border-t border-line pt-5 sm:mt-12">
          <p className="text-xs text-muted">{footerCopy.copyright}</p>
        </div>
      </Container>
    </footer>
  );
}
