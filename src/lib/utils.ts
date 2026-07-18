const DEFAULT_SITE_URL = "https://dondejuega.com";
const DEFAULT_ADSENSE_CLIENT = "ca-pub-5358801062744911";
const DEFAULT_ADSENSE_SLOTS = {
  top: "9527712632",
  feed: "3904685010",
  sidebar: "",
  detail: "",
  footer: "",
} as const;

/** Normaliza el ID de AdSense: acepta "pub-123" o "ca-pub-123" y devuelve "ca-pub-123". */
export function adsenseClient() {
  const raw = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim().replace(/^["']|["']$/g, "") || DEFAULT_ADSENSE_CLIENT;
  if (!raw || raw.includes("0000000000000000")) return DEFAULT_ADSENSE_CLIENT;
  return raw.startsWith("ca-") ? raw : `ca-${raw}`;
}

export function adsenseSlot(position: keyof typeof DEFAULT_ADSENSE_SLOTS) {
  const envMap = {
    top: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP,
    feed: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FEED,
    sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
    detail: process.env.NEXT_PUBLIC_ADSENSE_SLOT_DETAIL,
    footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER,
  } as const;
  const value = envMap[position]?.trim() || DEFAULT_ADSENSE_SLOTS[position];
  return value || undefined;
}

export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit && !explicit.includes("localhost")) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  if (explicit) return explicit.replace(/\/$/, "");
  return DEFAULT_SITE_URL;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatEventTime(iso: string, withDate = false) {
  return new Intl.DateTimeFormat("es-419", {
    weekday: withDate ? "short" : undefined,
    day: withDate ? "numeric" : undefined,
    month: withDate ? "short" : undefined,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Fecha corta + hora para tarjetas y destacados (ej. "sáb 18 jul · 3:00 p. m."). */
export function formatEventSchedule(iso: string) {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("es-419", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
  const time = new Intl.DateTimeFormat("es-419", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return { day, time, label: `${day} · ${time}` };
}

export function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat("es-419", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function relativeIso(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export function statusFromDate(iso: string): "live" | "upcoming" | "finished" {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < -3 * 60 * 60 * 1000) return "finished";
  if (diff <= 0) return "live";
  return "upcoming";
}
