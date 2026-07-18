"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const REFRESH_MS = 60_000;

export function LiveRefresh() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/login")) return;
    let running = false;
    const refresh = async () => {
      if (running || document.visibilityState !== "visible") return;
      running = true;
      try {
        const response = await fetch("/api/live", { cache: "no-store" });
        if (!response.ok) return;
        const body = (await response.json()) as { updated?: number };
        if (body.updated) router.refresh();
      } finally {
        running = false;
      }
    };
    const initial = window.setTimeout(refresh, 5_000);
    const interval = window.setInterval(refresh, REFRESH_MS);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [pathname, router]);

  return null;
}
