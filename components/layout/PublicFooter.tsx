import Image from "next/image";
import Link from "next/link";
import {
  footerColumns,
  footerCopy,
  footerLegal,
  footerSocial,
  type FooterSocialIcon,
} from "@/data/footer";
import { Container } from "@/components/layout/Container";
import { ChevronIcon } from "@/components/ui/icons";

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

          <aside className="flex flex-col gap-6 lg:items-end lg:text-right">
            <ul className="flex items-center gap-2.5">
              {footerSocial.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-white text-navy/65 transition-colors hover:text-navy"
                  >
                    <SocialIcon name={item.icon} />
                  </Link>
                </li>
              ))}
            </ul>

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

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-5 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">{footerCopy.copyright}</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {footerLegal.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs font-medium text-navy/60 transition-colors hover:text-navy"
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              aria-label="Language: English"
              className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold tracking-wide text-navy"
            >
              {footerCopy.language}
              <ChevronIcon className="size-2.5 text-navy/55" />
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function SocialIcon({ name }: { name: FooterSocialIcon }) {
  const className = "size-3.5";

  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
          d="M7 10.2V17M7 7.2v.01M12.2 17v-3.9c0-1.5.9-2.4 2.2-2.4 1.2 0 2.1.8 2.1 2.4V17M12.2 12.4V10.2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "x") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
          d="m7 7 10 10M17 7 7 17"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "youtube") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <rect
          x="4.5"
          y="7"
          width="15"
          height="10"
          rx="2.4"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M11 10.4 14.2 12 11 13.6v-3.2Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.2" cy="7.8" r="0.7" fill="currentColor" />
    </svg>
  );
}
