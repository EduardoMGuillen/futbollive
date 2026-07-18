import type { SportsEvent, StoreData } from "./types";
import { relativeIso, slugify } from "./utils";

const logos: Record<string, string> = {
  "Real Madrid": "https://r2.thesportsdb.com/images/media/team/badge/vwvwrw1473502969.png",
  Barcelona: "https://r2.thesportsdb.com/images/media/team/badge/k4zo0k1641767927.png",
  "Manchester City": "https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png",
  Liverpool: "https://r2.thesportsdb.com/images/media/team/badge/kfaher1737969724.png",
  "Los Angeles Lakers": "https://r2.thesportsdb.com/images/media/team/badge/d8uoxw1714254511.png",
  "Boston Celtics": "https://r2.thesportsdb.com/images/media/team/badge/4j85bn1667936589.png",
  "New York Yankees": "https://r2.thesportsdb.com/images/media/team/badge/wqwwxx1423478766.png",
  "Boston Red Sox": "https://r2.thesportsdb.com/images/media/team/badge/stpsus1425120215.png",
  "Inter Miami": "https://r2.thesportsdb.com/images/media/team/badge/m4it3e1602103647.png",
  "Bayern Múnich": "https://r2.thesportsdb.com/images/media/team/badge/01ogkh1716960412.png",
};

type SeedEvent = {
  sport: string;
  sportSlug: string;
  league: string;
  home: string;
  away: string;
  hours: number;
  importance: number;
  venue: string;
  country: string;
  featured?: boolean;
  score?: [number, number];
};

const seeds: SeedEvent[] = [
  { sport: "Fútbol", sportSlug: "futbol", league: "UEFA Champions League", home: "Real Madrid", away: "Manchester City", hours: -0.7, importance: 98, venue: "Santiago Bernabéu", country: "España", featured: true, score: [2, 1] },
  { sport: "Baloncesto", sportSlug: "baloncesto", league: "NBA", home: "Los Angeles Lakers", away: "Boston Celtics", hours: -0.4, importance: 96, venue: "Crypto.com Arena", country: "Estados Unidos", featured: true, score: [87, 84] },
  { sport: "Fútbol", sportSlug: "futbol", league: "LaLiga", home: "Barcelona", away: "Real Madrid", hours: 2.5, importance: 99, venue: "Estadi Olímpic", country: "España", featured: true },
  { sport: "Béisbol", sportSlug: "beisbol", league: "MLB", home: "New York Yankees", away: "Boston Red Sox", hours: 4, importance: 94, venue: "Yankee Stadium", country: "Estados Unidos", featured: true },
  { sport: "Fútbol", sportSlug: "futbol", league: "MLS", home: "Inter Miami", away: "LA Galaxy", hours: 5.5, importance: 90, venue: "Chase Stadium", country: "Estados Unidos" },
  { sport: "Tenis", sportSlug: "tenis", league: "ATP Masters 1000", home: "Carlos Alcaraz", away: "Jannik Sinner", hours: 7, importance: 95, venue: "Cancha Central", country: "Estados Unidos", featured: true },
  { sport: "Automovilismo", sportSlug: "automovilismo", league: "Fórmula 1", home: "Gran Premio de México", away: "Carrera", hours: 22, importance: 93, venue: "Autódromo Hermanos Rodríguez", country: "México", featured: true },
  { sport: "Fútbol", sportSlug: "futbol", league: "Premier League", home: "Liverpool", away: "Manchester City", hours: 25, importance: 94, venue: "Anfield", country: "Inglaterra" },
  { sport: "Hockey", sportSlug: "hockey", league: "NHL", home: "Florida Panthers", away: "Edmonton Oilers", hours: 27, importance: 87, venue: "Amerant Bank Arena", country: "Estados Unidos" },
  { sport: "Fútbol americano", sportSlug: "futbol-americano", league: "NFL", home: "Kansas City Chiefs", away: "Philadelphia Eagles", hours: 30, importance: 96, venue: "Arrowhead Stadium", country: "Estados Unidos", featured: true },
  { sport: "MMA", sportSlug: "mma", league: "UFC", home: "Pelea estelar", away: "Evento principal", hours: 31, importance: 89, venue: "T-Mobile Arena", country: "Estados Unidos" },
  { sport: "Voleibol", sportSlug: "voleibol", league: "Liga de Naciones", home: "Brasil", away: "Argentina", hours: 33, importance: 81, venue: "Maracanãzinho", country: "Brasil" },
];

export function getSeedEvents(): SportsEvent[] {
  const now = new Date().toISOString();
  return seeds.map((item, index) => {
    const startsAt = relativeIso(item.hours);
    const status = item.hours <= 0 && item.hours > -3 ? "live" : item.hours <= -3 ? "finished" : "upcoming";
    const homeSlug = slugify(item.home);
    const awaySlug = slugify(item.away);
    return {
      id: `demo-${index + 1}`,
      slug: `${homeSlug}-vs-${awaySlug}-${index + 1}`,
      sport: item.sport,
      sportSlug: item.sportSlug,
      league: item.league,
      leagueSlug: slugify(item.league),
      home: { name: item.home, slug: homeSlug, logo: logos[item.home], score: item.score?.[0] },
      away: { name: item.away, slug: awaySlug, logo: logos[item.away], score: item.score?.[1] },
      startsAt,
      status,
      minute: status === "live" ? (item.sportSlug === "futbol" ? "67′" : "EN VIVO") : undefined,
      venue: item.venue,
      country: item.country,
      importance: item.importance,
      featured: item.featured,
      description: `${item.home} y ${item.away} se enfrentan en ${item.league}. Consulta el horario en tu zona local y la información disponible del evento.`,
      source: "demo",
      updatedAt: now,
    };
  });
}

export function getSeedData(): StoreData {
  return {
    events: getSeedEvents(),
    banners: [
      { id: "top-1", title: "Tu marca puede estar aquí", label: "PUBLICIDAD", position: "top", active: true },
      { id: "feed-1", title: "Espacio premium disponible", label: "PATROCINADO", position: "feed", active: true },
      { id: "sidebar-1", title: "Conecta con fans del deporte", label: "PUBLICIDAD", position: "sidebar", active: true },
      { id: "detail-1", title: "Patrocina este encuentro", label: "PATROCINADO", position: "detail", active: true },
      { id: "footer-1", title: "Tu marca frente a fans reales", label: "PUBLICIDAD", position: "footer", active: true },
    ],
    settings: { liveThreshold: 85, maxFeaturedLive: 6, ctaEnabled: false },
  };
}
