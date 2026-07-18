"use client";

import { usePathname } from "next/navigation";
import type { Banner } from "@/lib/types";
import { AdSlot } from "./AdSlot";

const footerBanner: Banner = {
  id: "global-footer",
  title: "Tu marca frente a fans reales",
  label: "PUBLICIDAD",
  position: "footer",
  active: true,
};

export function GlobalAd() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/login")) return null;
  return <div className="container global-promo"><AdSlot banner={footerBanner} /></div>;
}
