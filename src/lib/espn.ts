import type { SportsEvent } from "./types";
import { slugify } from "./utils";

type EspnLeague = {
  path: string;
  league: string;
  sport: string;
  importance: number;
};

const leagues: EspnLeague[] = [
  { path: "soccer/uefa.champions", league: "UEFA Champions League", sport: "Fútbol", importance: 97 },
  { path: "soccer/uefa.europa", league: "UEFA Europa League", sport: "Fútbol", importance: 88 },
  { path: "soccer/esp.1", league: "LaLiga", sport: "Fútbol", importance: 93 },
  { path: "soccer/eng.1", league: "Premier League", sport: "Fútbol", importance: 93 },
  { path: "soccer/ita.1", league: "Serie A", sport: "Fútbol", importance: 90 },
  { path: "soccer/ger.1", league: "Bundesliga", sport: "Fútbol", importance: 90 },
  { path: "soccer/fra.1", league: "Ligue 1", sport: "Fútbol", importance: 87 },
  { path: "soccer/mex.1", league: "Liga MX", sport: "Fútbol", importance: 92 },
  { path: "soccer/usa.1", league: "MLS", sport: "Fútbol", importance: 88 },
  { path: "soccer/arg.1", league: "Liga Profesional Argentina", sport: "Fútbol", importance: 89 },
  { path: "soccer/bra.1", league: "Brasileirão", sport: "Fútbol", importance: 88 },
  { path: "soccer/conmebol.libertadores", league: "Copa Libertadores", sport: "Fútbol", importance: 93 },
  { path: "soccer/concacaf.champions", league: "Copa de Campeones Concacaf", sport: "Fútbol", importance: 86 },
  { path: "basketball/nba", league: "NBA", sport: "Baloncesto", importance: 94 },
  { path: "basketball/wnba", league: "WNBA", sport: "Baloncesto", importance: 80 },
  { path: "baseball/mlb", league: "MLB", sport: "Béisbol", importance: 88 },
  { path: "football/nfl", league: "NFL", sport: "Fútbol americano", importance: 95 },
  { path: "hockey/nhl", league: "NHL", sport: "Hockey", importance: 86 },
];

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
  const range = `${format(-1)}-${format(5)}`;
  const results: SportsEvent[] = [];
  // Small sequential groups keep us polite with the public API.
  const groupSize = 6;
  for (let index = 0; index < leagues.length; index += groupSize) {
    const group = leagues.slice(index, index + groupSize);
    const batches = await Promise.all(group.map((league) => fetchLeagueRange(league, range)));
    results.push(...batches.flat());
  }
  const unique = new Map<string, SportsEvent>();
  for (const event of results) unique.set(event.id, event);
  return Array.from(unique.values());
}
