"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace("#", "");
      if (!id) {
        return;
      }

      document.getElementById(id)?.scrollIntoView();
    };

    scrollToHash();
    const frame = window.requestAnimationFrame(scrollToHash);
    const timeout = window.setTimeout(scrollToHash, 80);
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [pathname]);

  return null;
}
