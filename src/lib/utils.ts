import type { SportsEvent } from "./types";

const DEFAULT_SITE_URL = "https://dondejuega.com";
const DEFAULT_ADSENSE_CLIENT = "ca-pub-5358801062744911";
const DEFAULT_ADSENSE_SLOTS = {
  top: "9527712632",
  feed: "3904685010",
  sidebar: "7109552999",
  detail: "1258460518",
  footer: "4287948530",
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
  // Custom domain in production even if env vars are missing on Vercel.
  if (process.env.VERCEL_ENV === "production") return DEFAULT_SITE_URL;
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

export function eventTitle(event: SportsEvent) {
  return event.format === "multi" && event.eventName
    ? event.eventName
    : `${event.home.name} vs ${event.away.name}`;
}

/** Tiempo máximo razonable de juego antes de inferir "finalizado" sin respuesta fresca de la fuente. */
export function heuristicFinishMs(event: SportsEvent) {
  if (event.format === "multi") return 5 * 24 * 60 * 60 * 1000;
  if (event.source === "pandascore") {
    return (event.bestOf || 3) * 70 * 60 * 1000 + 60 * 60 * 1000;
  }
  if (event.sportSlug === "cricket") return 12 * 60 * 60 * 1000;
  if (event.sportSlug === "beisbol") return 4.5 * 60 * 60 * 1000;
  if (event.sportSlug === "mma") return 5 * 60 * 60 * 1000;
  return 3 * 60 * 60 * 1000;
}

export function eventDurationMs(event: SportsEvent) {
  return heuristicFinishMs(event);
}

export function isPubliclyVisible(event: SportsEvent, now = Date.now()) {
  if (event.status !== "finished") return true;
  const estimatedEnd = new Date(event.startsAt).getTime() + eventDurationMs(event);
  const graceMs =
    event.importance >= 97 || event.leagueSlug === "copa-del-mundo-fifa" ? 48 * 60 * 60 * 1000 : 6 * 60 * 60 * 1000;
  return now - estimatedEnd < graceMs;
}

/** Editorial ranking for the homepage: major football first, then other sports. */
const FOOTBALL_LEAGUE_BOOST: Record<string, number> = {
  "copa-del-mundo-fifa": 55,
  "copa-del-mundo-femenina-fifa": 48,
  "uefa-champions-league": 50,
  "copa-america": 48,
  eurocopa: 48,
  laliga: 45,
  "premier-league": 42,
  "copa-libertadores": 42,
  "liga-mx": 40,
  "liga-profesional-argentina": 36,
  "copa-sudamericana": 34,
  "serie-a": 34,
  bundesliga: 34,
  mls: 32,
  brasileirao: 32,
};

export function homepageScore(event: SportsEvent) {
  let score = event.importance;
  if (event.sportSlug === "futbol") score += 30;
  score += FOOTBALL_LEAGUE_BOOST[event.leagueSlug] || 0;
  if (event.featured) score += 8;
  if (event.status === "live") score += 12;
  // High-volume individual sports should not crowd the main feed.
  if (event.sportSlug === "tenis") score -= 28;
  if (event.sportSlug === "golf") score -= 22;
  if (event.sportSlug === "lacrosse" || event.sportSlug === "cricket") score -= 18;
  if (event.sportSlug === "mma") score -= 8;
  if (event.sportSlug === "automovilismo") score -= 6;
  // Los esports viven en su propio hub; en la portada solo destacan los tier S.
  if (event.source === "pandascore" && !event.featured) score -= 14;
  return score;
}

export function compareHomepageEvents(a: SportsEvent, b: SportsEvent) {
  const byScore = homepageScore(b) - homepageScore(a);
  if (byScore !== 0) return byScore;
  return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
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
