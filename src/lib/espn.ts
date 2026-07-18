import type { SportsEvent } from "./types";
import { slugify } from "./utils";

type EspnLeague = {
  path: string;
  league: string;
  sport: string;
  importance: number;
};

const leagues: EspnLeague[] = [
  // Torneos de selecciones (Mundial y similares) primero: máxima prioridad editorial.
  { path: "soccer/fifa.world", league: "Copa del Mundo FIFA", sport: "Fútbol", importance: 100 },
  { path: "soccer/fifa.wwc", league: "Copa del Mundo Femenina FIFA", sport: "Fútbol", importance: 95 },
  { path: "soccer/fifa.cwc", league: "Mundial de Clubes FIFA", sport: "Fútbol", importance: 94 },
  { path: "soccer/fifa.olympics", league: "Fútbol Olímpico", sport: "Fútbol", importance: 91 },
  { path: "soccer/fifa.world.u20", league: "Mundial Sub-20 FIFA", sport: "Fútbol", importance: 84 },
  { path: "soccer/uefa.euro", league: "Eurocopa", sport: "Fútbol", importance: 98 },
  { path: "soccer/conmebol.america", league: "Copa América", sport: "Fútbol", importance: 97 },
  { path: "soccer/concacaf.gold", league: "Copa Oro Concacaf", sport: "Fútbol", importance: 90 },
  { path: "soccer/caf.nations", league: "Copa África", sport: "Fútbol", importance: 88 },
  { path: "soccer/afc.asian.cup", league: "Copa Asiática", sport: "Fútbol", importance: 85 },
  { path: "soccer/uefa.nations", league: "UEFA Nations League", sport: "Fútbol", importance: 86 },

  // Clubes Europa
  { path: "soccer/uefa.champions", league: "UEFA Champions League", sport: "Fútbol", importance: 97 },
  { path: "soccer/uefa.europa", league: "UEFA Europa League", sport: "Fútbol", importance: 88 },
  { path: "soccer/uefa.europa.conf", league: "UEFA Conference League", sport: "Fútbol", importance: 82 },
  { path: "soccer/uefa.super_cup", league: "UEFA Super Cup", sport: "Fútbol", importance: 84 },
  { path: "soccer/esp.1", league: "LaLiga", sport: "Fútbol", importance: 93 },
  { path: "soccer/esp.copa_del_rey", league: "Copa del Rey", sport: "Fútbol", importance: 86 },
  { path: "soccer/eng.1", league: "Premier League", sport: "Fútbol", importance: 93 },
  { path: "soccer/eng.fa", league: "FA Cup", sport: "Fútbol", importance: 86 },
  { path: "soccer/eng.league_cup", league: "Carabao Cup", sport: "Fútbol", importance: 80 },
  { path: "soccer/ita.1", league: "Serie A", sport: "Fútbol", importance: 90 },
  { path: "soccer/ita.coppa_italia", league: "Coppa Italia", sport: "Fútbol", importance: 82 },
  { path: "soccer/ger.1", league: "Bundesliga", sport: "Fútbol", importance: 90 },
  { path: "soccer/ger.dfb_pokal", league: "DFB Pokal", sport: "Fútbol", importance: 82 },
  { path: "soccer/fra.1", league: "Ligue 1", sport: "Fútbol", importance: 87 },
  { path: "soccer/fra.coupe_de_france", league: "Copa de Francia", sport: "Fútbol", importance: 80 },
  { path: "soccer/por.1", league: "Primeira Liga", sport: "Fútbol", importance: 84 },
  { path: "soccer/ned.1", league: "Eredivisie", sport: "Fútbol", importance: 82 },
  { path: "soccer/tur.1", league: "Süper Lig", sport: "Fútbol", importance: 80 },
  { path: "soccer/sco.1", league: "Scottish Premiership", sport: "Fútbol", importance: 78 },
  { path: "soccer/bel.1", league: "Pro League Bélgica", sport: "Fútbol", importance: 78 },

  // Concacaf / Norteamérica
  { path: "soccer/mex.1", league: "Liga MX", sport: "Fútbol", importance: 92 },
  { path: "soccer/mex.copa_mx", league: "Copa MX", sport: "Fútbol", importance: 78 },
  { path: "soccer/usa.1", league: "MLS", sport: "Fútbol", importance: 88 },
  { path: "soccer/usa.open", league: "U.S. Open Cup", sport: "Fútbol", importance: 76 },
  { path: "soccer/concacaf.champions", league: "Copa de Campeones Concacaf", sport: "Fútbol", importance: 86 },
  { path: "soccer/concacaf.leagues.cup", league: "Leagues Cup", sport: "Fútbol", importance: 85 },
  { path: "soccer/crc.1", league: "Liga Promerica Costa Rica", sport: "Fútbol", importance: 76 },
  { path: "soccer/gua.1", league: "Liga Nacional Guatemala", sport: "Fútbol", importance: 74 },
  { path: "soccer/hon.1", league: "Liga Nacional Honduras", sport: "Fútbol", importance: 74 },
  { path: "soccer/slv.1", league: "Primera División El Salvador", sport: "Fútbol", importance: 72 },

  // Conmebol / Sudamérica
  { path: "soccer/conmebol.libertadores", league: "Copa Libertadores", sport: "Fútbol", importance: 93 },
  { path: "soccer/conmebol.sudamericana", league: "Copa Sudamericana", sport: "Fútbol", importance: 90 },
  { path: "soccer/conmebol.recopa", league: "Recopa Sudamericana", sport: "Fútbol", importance: 87 },
  { path: "soccer/arg.1", league: "Liga Profesional Argentina", sport: "Fútbol", importance: 89 },
  { path: "soccer/arg.copa", league: "Copa Argentina", sport: "Fútbol", importance: 82 },
  { path: "soccer/bra.1", league: "Brasileirão", sport: "Fútbol", importance: 88 },
  { path: "soccer/chi.1", league: "Primera División Chile", sport: "Fútbol", importance: 84 },
  { path: "soccer/col.1", league: "Liga BetPlay Colombia", sport: "Fútbol", importance: 85 },
  { path: "soccer/per.1", league: "Liga 1 Perú", sport: "Fútbol", importance: 82 },
  { path: "soccer/uru.1", league: "Liga AUF Uruguaya", sport: "Fútbol", importance: 83 },
  { path: "soccer/ecu.1", league: "LigaPro Ecuador", sport: "Fútbol", importance: 81 },
  { path: "soccer/par.1", league: "Primera División Paraguay", sport: "Fútbol", importance: 80 },
  { path: "soccer/bol.1", league: "División Profesional Bolivia", sport: "Fútbol", importance: 76 },
  { path: "soccer/ven.1", league: "Liga FUTVE Venezuela", sport: "Fútbol", importance: 76 },

  // Asia / Oriente Medio / África
  { path: "soccer/afc.champions", league: "AFC Champions League", sport: "Fútbol", importance: 82 },
  { path: "soccer/caf.champions", league: "CAF Champions League", sport: "Fútbol", importance: 80 },
  { path: "soccer/ksa.1", league: "Saudi Pro League", sport: "Fútbol", importance: 84 },
  { path: "soccer/jpn.1", league: "J.League", sport: "Fútbol", importance: 78 },
  { path: "soccer/aus.1", league: "A-League", sport: "Fútbol", importance: 74 },

  // Otros deportes de equipo
  { path: "basketball/nba", league: "NBA", sport: "Baloncesto", importance: 94 },
  { path: "basketball/wnba", league: "WNBA", sport: "Baloncesto", importance: 80 },
  { path: "baseball/mlb", league: "MLB", sport: "Béisbol", importance: 88 },
  { path: "football/nfl", league: "NFL", sport: "Fútbol americano", importance: 95 },
  { path: "hockey/nhl", league: "NHL", sport: "Hockey", importance: 86 },
];

/** Ventana más amplia para torneos de selecciones (fases eliminatorias). */
function dateWindowDays(league: EspnLeague) {
  if (league.importance >= 97 || league.path.includes("fifa.world") || league.path.includes("fifa.wwc")) {
    return { past: 10, future: 14 };
  }
  return { past: 1, future: 5 };
}

type EspnCompetitor = {
  homeAway?: string;
  score?: string;
  team?: { displayName?: string; logo?: string };
};

type EspnEvent = {
  id: string;
  date: string;
  status?: {
    displayClock?: string;
    type?: { state?: string; shortDetail?: string; completed?: boolean };
  };
  competitions?: Array<{
    venue?: { fullName?: string; address?: { city?: string; country?: string } };
    competitors?: EspnCompetitor[];
  }>;
};

function statusFrom(event: EspnEvent): SportsEvent["status"] {
  const state = event.status?.type?.state;
  if (state === "in") return "live";
  if (state === "post") return "finished";
  return "upcoming";
}

function minuteFrom(event: EspnEvent) {
  const detail = event.status?.type?.shortDetail;
  const clock = event.status?.displayClock;
  if (clock && clock !== "0:00" && clock !== "0'") return clock;
  return detail || undefined;
}

async function fetchLeagueRange(league: EspnLeague, range: string): Promise<SportsEvent[]> {
  try {
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${league.path}/scoreboard?dates=${range}`,
      { next: { revalidate: 900 }, headers: { accept: "application/json" } },
    );
    if (!response.ok) return [];
    const body = (await response.json()) as { events?: EspnEvent[] };
    const events = body.events || [];
    return events.flatMap((event) => {
      const competition = event.competitions?.[0];
      const competitors = competition?.competitors || [];
      const home = competitors.find((item) => item.homeAway === "home") || competitors[0];
      const away = competitors.find((item) => item.homeAway === "away") || competitors[1];
      if (!home?.team?.displayName || !away?.team?.displayName) return [];
      const status = statusFrom(event);
      const homeSlug = slugify(home.team.displayName);
      const awaySlug = slugify(away.team.displayName);
      const venue = competition?.venue;
      const item: SportsEvent = {
        id: `espn-${slugify(league.path)}-${event.id}`,
        slug: `${homeSlug}-vs-${awaySlug}-${event.id}`,
        sport: league.sport,
        sportSlug: slugify(league.sport),
        league: league.league,
        leagueSlug: slugify(league.league),
        home: {
          name: home.team.displayName,
          slug: homeSlug,
          logo: home.team.logo,
          score: home.score !== undefined && home.score !== "" ? Number(home.score) : undefined,
        },
        away: {
          name: away.team.displayName,
          slug: awaySlug,
          logo: away.team.logo,
          score: away.score !== undefined && away.score !== "" ? Number(away.score) : undefined,
        },
        startsAt: new Date(event.date).toISOString(),
        status,
        minute: status === "live" ? minuteFrom(event) : undefined,
        venue: venue?.fullName || undefined,
        country: venue?.address?.country || venue?.address?.city || undefined,
        importance: status === "live" ? Math.min(100, league.importance + 2) : league.importance,
        featured: league.importance >= 90,
        source: "espn",
        updatedAt: new Date().toISOString(),
      };
      return [item];
    });
  } catch {
    return [];
  }
}

export async function fetchEspnEvents(): Promise<SportsEvent[]> {
  const format = (offset: number) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + offset);
    return date.toISOString().slice(0, 10).replace(/-/g, "");
  };
  const results: SportsEvent[] = [];
  // Small sequential groups keep us polite with the public API.
  const groupSize = 6;
  for (let index = 0; index < leagues.length; index += groupSize) {
    const group = leagues.slice(index, index + groupSize);
    const batches = await Promise.all(
      group.map((league) => {
        const window = dateWindowDays(league);
        const range = `${format(-window.past)}-${format(window.future)}`;
        return fetchLeagueRange(league, range);
      }),
    );
    results.push(...batches.flat());
  }
  const unique = new Map<string, SportsEvent>();
  for (const event of results) unique.set(event.id, event);
  return Array.from(unique.values());
}
