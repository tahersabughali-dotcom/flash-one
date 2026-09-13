"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { isPublicNavActive, publicNav } from "@/data/navigation";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import {
  ChevronIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
} from "@/components/ui/icons";

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <Container className="pt-5">
        <div className="flex items-center justify-between gap-4 rounded-(--radius-panel) border border-white/40 bg-white/25 px-4 py-2 shadow-(--shadow-glass) backdrop-blur-xl sm:px-6">
          <Link href="/" aria-label="Flash One" className="flex shrink-0 items-center">
            <Image
              src="/brand/flash-one-logo.png"
              alt="Flash One"
              width={210}
              height={140}
              priority
              className="h-12 w-auto object-contain lg:h-14"
            />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 lg:flex"
          >
            {publicNav.map((item) => {
              const active = isPublicNavActive(item.href, pathname);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={[
                    "rounded-full px-3 py-1.5 text-[13px] font-medium tracking-tight transition-colors",
                    active
                      ? "bg-white/70 text-navy shadow-sm"
                      : "text-navy/70 hover:text-navy",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Search"
              className="hidden size-10 items-center justify-center rounded-full border border-line bg-white/50 text-navy/70 md:inline-flex"
            >
              <SearchIcon className="size-4" />
            </button>

            <button
              type="button"
              aria-label="Language: English"
              className="hidden items-center gap-1 rounded-full border border-line bg-white/50 px-3 py-2 text-xs font-semibold tracking-wide text-navy md:inline-flex"
            >
              EN
              <ChevronIcon className="size-2.5 text-navy/60" />
            </button>

            <Button href="/#start-a-project" arrow className="max-sm:px-3 max-sm:text-xs">
              Start a Project
            </Button>

            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-white/60 text-navy lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <CloseIcon className="size-4" /> : <MenuIcon className="size-4" />}
            </button>
          </div>
        </div>

        {open ? (
          <div
            id="mobile-navigation"
            className="mt-2 rounded-(--radius-card) border border-white/60 bg-white/90 p-3 shadow-(--shadow-soft) backdrop-blur-xl lg:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col">
              {publicNav.map((item) => {
                const active = isPublicNavActive(item.href, pathname);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={[
                      "rounded-2xl px-3 py-2.5 text-sm font-medium",
                      active ? "bg-white text-navy shadow-sm" : "text-navy",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
