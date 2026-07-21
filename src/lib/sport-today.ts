export const SPORT_TODAY_PAGES = [
  { slug: "futbol-hoy", sportSlug: "futbol", sportName: "Fútbol", seoTitle: "Fútbol hoy: partidos, horarios y dónde ver", hubHref: "/deporte/futbol" },
  { slug: "baloncesto-hoy", sportSlug: "baloncesto", sportName: "Baloncesto", seoTitle: "NBA y baloncesto hoy: partidos y horarios", hubHref: "/deporte/baloncesto" },
  { slug: "beisbol-hoy", sportSlug: "beisbol", sportName: "Béisbol", seoTitle: "Béisbol hoy: partidos y horarios", hubHref: "/deporte/beisbol" },
  { slug: "tenis-hoy", sportSlug: "tenis", sportName: "Tenis", seoTitle: "Tenis hoy: partidos y horarios", hubHref: "/deporte/tenis" },
  { slug: "mma-hoy", sportSlug: "mma", sportName: "MMA", seoTitle: "UFC y MMA hoy: peleas y horarios", hubHref: "/deporte/mma" },
  { slug: "f1-hoy", sportSlug: "automovilismo", sportName: "Fórmula 1", seoTitle: "F1 hoy: carreras y horarios", hubHref: "/deporte/automovilismo" },
  { slug: "valorant-hoy", sportSlug: "valorant", sportName: "Valorant", seoTitle: "Valorant hoy: series VCT, horarios y dónde ver", hubHref: "/esports/valorant", isEsport: true },
  { slug: "lol-hoy", sportSlug: "league-of-legends", sportName: "League of Legends", seoTitle: "LoL hoy: LEC, LCK y Worlds en vivo", hubHref: "/esports/league-of-legends", isEsport: true },
  { slug: "cs2-hoy", sportSlug: "cs2", sportName: "Counter-Strike 2", seoTitle: "CS2 hoy: Majors y series en vivo", hubHref: "/esports/cs2", isEsport: true },
] as const;

export function resolveSportToday(slug: string) {
  return SPORT_TODAY_PAGES.find((item) => item.slug === slug);
}

export function isEventToday(iso: string, now = new Date()) {
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate();
}
