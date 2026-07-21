import Link from "next/link";
import type { ReactNode } from "react";

export type BlogLinkTarget = {
  label: string;
  href: string;
};

/** Auto-enlaza menciones de equipos/ligas en párrafos del blog (primera coincidencia por etiqueta, más largas primero). */
export function linkBlogMentions(text: string, targets: BlogLinkTarget[]): ReactNode[] {
  if (!targets.length) return [text];
  const sorted = [...targets].sort((a, b) => b.label.length - a.label.length);
  const pattern = new RegExp(`(${sorted.map((t) => escapeRegExp(t.label)).join("|")})`, "gi");
  const parts = text.split(pattern);
  const hrefByLabel = new Map(sorted.map((t) => [t.label.toLowerCase(), t.href]));
  return parts.map((part, index) => {
    const href = hrefByLabel.get(part.toLowerCase());
    if (!href) return <span key={index}>{part}</span>;
    return (
      <Link key={index} href={href} className="blog-auto-link">
        {part}
      </Link>
    );
  });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const WORLD_CUP_BLOG_LINKS: BlogLinkTarget[] = [
  { label: "Copa del Mundo FIFA", href: "/liga/copa-del-mundo-fifa" },
  { label: "Mundial 2026", href: "/liga/copa-del-mundo-fifa" },
  { label: "Mundial FIFA 2026", href: "/liga/copa-del-mundo-fifa" },
  { label: "España", href: "/equipo/espana" },
  { label: "Argentina", href: "/equipo/argentina" },
  { label: "La Roja", href: "/equipo/espana" },
  { label: "MetLife Stadium", href: "/partido/spain-vs-argentina-760517" },
];
