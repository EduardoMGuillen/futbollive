import type { BroadcastOption, SportsEvent } from "./types";
import { slugify } from "./utils";

/** Emisión oficial de La Velada (Twitch / YouTube / TikTok de Ibai). */
const VELADA_BROADCASTS: BroadcastOption[] = [
  { name: "Twitch Ibai", type: "streaming", region: "global", url: "https://www.twitch.tv/ibai" },
  { name: "YouTube Ibai", type: "streaming", region: "global", url: "https://www.youtube.com/@IbaiLlanos" },
  { name: "TikTok Ibai", type: "streaming", region: "global", url: "https://www.tiktok.com/@ibai" },
];

/** Logo del evento y fotos de pelea (archivos en /public/velada). */
export const VELADA_LOGO = "/velada/logo.png";

/** Deportes y ligas solo editoriales (no están en ESPN). */
export const EDITORIAL_SPORTS = [{ slug: "boxeo", name: "Boxeo" }] as const;

export const EDITORIAL_LEAGUES = [
  {
    path: "editorial/la-velada-del-ano-vi",
    league: "La Velada del Año VI",
    leagueSlug: "la-velada-del-ano-vi",
    sport: "Boxeo",
    sportSlug: "boxeo",
  },
] as const;

const VELADA_PHOTOS: Record<string, string> = {
  "fabiana-sevillano": "/velada/fabiana-sevillano.png",
  "la-parce": "/velada/la-parce.png",
  clersss: "/velada/clersss.png",
  "natalia-mx": "/velada/natalia-mx.png",
  "edu-aguirre": "/velada/edu-aguirre.png",
  "gaston-edul": "/velada/gaston-edul.png",
  "marta-diaz": "/velada/marta-diaz.png",
  "tatiana-kaer": "/velada/tatiana-kaer.png",
  viruzz: "/velada/viruzz.png",
  "gero-arias": "/velada/gero-arias.png",
  alondrissa: "/velada/alondrissa.png",
  "angie-velasco": "/velada/angie-velasco.png",
  "lit-killah": "/velada/lit-killah.png",
  "kidd-keo": "/velada/kidd-keo.png",
  "samy-rivers": "/velada/samy-rivers.png",
  roro: "/velada/roro.png",
  plex: "/velada/plex.png",
  fernanfloo: "/velada/fernanfloo.png",
  thegrefg: "/velada/thegrefg.png",
  illojuan: "/velada/illojuan.png",
};

function photoFor(name: string) {
  return VELADA_PHOTOS[slugify(name)] || VELADA_LOGO;
}

type EditorialFight = {
  id: string;
  home: string;
  away: string;
  /** ISO UTC */
  startsAt: string;
  roundLabel: string;
  importance: number;
  featured?: boolean;
};

/**
 * Cartel La Velada del Año VI — 25 jul 2026, Estadio La Cartuja (Sevilla).
 * Horarios aproximados en UTC (España CEST = UTC+2). Primer combate ~19:45 local; main event ~01:30.
 * Fuentes: Infobae / Xataka / cartel oficial Ibai.
 */
const VELADA_VI_FIGHTS: EditorialFight[] = [
  { id: "editorial-velada-vi-01", home: "Fabiana Sevillano", away: "La Parce", startsAt: "2026-07-25T17:45:00.000Z", roundLabel: "Combate 1", importance: 88 },
  { id: "editorial-velada-vi-02", home: "Clersss", away: "Natalia MX", startsAt: "2026-07-25T18:15:00.000Z", roundLabel: "Combate 2", importance: 88 },
  { id: "editorial-velada-vi-03", home: "Edu Aguirre", away: "Gastón Edul", startsAt: "2026-07-25T18:45:00.000Z", roundLabel: "Combate 3", importance: 90 },
  { id: "editorial-velada-vi-04", home: "Marta Díaz", away: "Tatiana Käer", startsAt: "2026-07-25T19:15:00.000Z", roundLabel: "Combate 4", importance: 89 },
  { id: "editorial-velada-vi-05", home: "Viruzz", away: "Gero Arias", startsAt: "2026-07-25T19:45:00.000Z", roundLabel: "Combate 5", importance: 91 },
  { id: "editorial-velada-vi-06", home: "Alondrissa", away: "Angie Velasco", startsAt: "2026-07-25T20:15:00.000Z", roundLabel: "Combate 6", importance: 90 },
  { id: "editorial-velada-vi-07", home: "Lit Killah", away: "Kidd Keo", startsAt: "2026-07-25T20:45:00.000Z", roundLabel: "Combate 7", importance: 92 },
  { id: "editorial-velada-vi-08", home: "Samy Rivers", away: "RoRo", startsAt: "2026-07-25T21:15:00.000Z", roundLabel: "Combate 8", importance: 93 },
  { id: "editorial-velada-vi-09", home: "Plex", away: "Fernanfloo", startsAt: "2026-07-25T22:00:00.000Z", roundLabel: "Combate 9 · Coestelar", importance: 97, featured: true },
  { id: "editorial-velada-vi-10", home: "TheGrefg", away: "IlloJuan", startsAt: "2026-07-25T23:30:00.000Z", roundLabel: "Combate 10 · Main event", importance: 99, featured: true },
];

function fightToEvent(fight: EditorialFight, nowIso: string): SportsEvent {
  const homeSlug = slugify(fight.home);
  const awaySlug = slugify(fight.away);
  const startMs = new Date(fight.startsAt).getTime();
  const now = Date.now();
  const durationMs = 45 * 60 * 1000;
  let status: SportsEvent["status"] = "upcoming";
  if (now >= startMs + durationMs) status = "finished";
  else if (now >= startMs) status = "live";
  const active = status !== "finished";

  return {
    id: fight.id,
    slug: `${homeSlug}-vs-${awaySlug}-${fight.id.replace(/[^a-z0-9]+/gi, "-")}`,
    sport: "Boxeo",
    sportSlug: "boxeo",
    league: "La Velada del Año VI",
    leagueSlug: "la-velada-del-ano-vi",
    roundLabel: fight.roundLabel,
    phase: fight.featured ? "final" : "other",
    home: { name: fight.home, slug: homeSlug, logo: photoFor(fight.home) },
    away: { name: fight.away, slug: awaySlug, logo: photoFor(fight.away) },
    startsAt: fight.startsAt,
    status,
    minute: status === "live" ? "EN VIVO" : undefined,
    venue: "Estadio La Cartuja",
    country: "España",
    importance: active ? Math.max(fight.importance, 98) : fight.importance,
    featured: active,
    description: `${fight.home} vs ${fight.away} en La Velada del Año VI (Ibai Llanos). Boxeo amateur de creadores en Sevilla. Transmisión gratis en Twitch, YouTube y TikTok.`,
    broadcasts: VELADA_BROADCASTS,
    source: "manual",
    updatedAt: nowIso,
  };
}

/** Eventos editoriales curados (no vienen de ESPN). Se reinyectan en cada sync. */
export function getEditorialEvents(): SportsEvent[] {
  const nowIso = new Date().toISOString();
  return VELADA_VI_FIGHTS.map((fight) => fightToEvent(fight, nowIso));
}

/**
 * Héroe de portada mientras dure La Velada:
 * - combate en vivo actual, o
 * - próximo combate, o
 * - main event (poster) si aún no arranca la noche.
 * Devuelve null cuando toda la cartelera ya terminó.
 */
export function getPinnedEditorialHero(events: SportsEvent[]): SportsEvent | null {
  const velada = events.filter(
    (event) => event.leagueSlug === "la-velada-del-ano-vi" && !event.hidden,
  );
  if (!velada.length) return null;

  const live = velada
    .filter((event) => event.status === "live")
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
  if (live[0]) return live[0];

  const upcoming = velada
    .filter((event) => event.status === "upcoming")
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  if (!upcoming.length) return null;

  const firstStart = new Date(upcoming[0].startsAt).getTime();
  if (Date.now() < firstStart) {
    return upcoming.find((event) => event.id.endsWith("-10")) || upcoming[upcoming.length - 1];
  }
  return upcoming[0];
}

/** Fusiona cartel editorial en un listado de eventos (preserva marcador/estado si ya se editó). */
export function mergeEditorialEvents(events: SportsEvent[]): SportsEvent[] {
  const byId = new Map(events.map((event) => [event.id, event]));
  for (const editorial of getEditorialEvents()) {
    const current = byId.get(editorial.id);
    if (!current) {
      byId.set(editorial.id, editorial);
      continue;
    }
    byId.set(editorial.id, {
      ...editorial,
      status: current.status !== "upcoming" ? current.status : editorial.status,
      minute: current.status === "live" ? current.minute || editorial.minute : editorial.minute,
      home: {
        ...editorial.home,
        score: current.home.score ?? editorial.home.score,
        logo: editorial.home.logo || current.home.logo,
      },
      away: {
        ...editorial.away,
        score: current.away.score ?? editorial.away.score,
        logo: editorial.away.logo || current.away.logo,
      },
      featured: editorial.featured || current.featured,
      hidden: current.hidden,
      excludedFromLive: current.excludedFromLive,
      updatedAt: current.updatedAt,
    });
  }
  return Array.from(byId.values());
}
