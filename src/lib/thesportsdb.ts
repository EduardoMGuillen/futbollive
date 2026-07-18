import type { SportsEvent } from "./types";
import { slugify } from "./utils";

type ApiEvent = {
  idEvent: string;
  strEvent: string;
  strSport: string;
  strLeague: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
  strTimestamp?: string;
  dateEvent?: string;
  strTime?: string;
  strStatus?: string;
  intHomeScore?: string;
  intAwayScore?: string;
  strVenue?: string;
  strCountry?: string;
  strDescriptionEN?: string;
};

type ApiLineup = {
  strPosition?: string;
  strHome?: string;
  strSubstitute?: string;
  intSquadNumber?: string;
  strPlayer?: string;
};

const sportNames: Record<string, string> = {
  Soccer: "Fútbol",
  Basketball: "Baloncesto",
  Baseball: "Béisbol",
  "American Football": "Fútbol americano",
  Ice_Hockey: "Hockey",
  Motorsport: "Automovilismo",
  Fighting: "MMA",
  Tennis: "Tenis",
  Volleyball: "Voleibol",
};

const priorityWords = [
  "world cup", "champions", "premier", "la liga", "serie a", "bundesliga",
  "libertadores", "liga mx", "mls", "nba", "nfl", "mlb", "nhl", "formula 1",
  "ufc", "atp", "wta", "copa america",
];

function importanceFor(event: ApiEvent) {
  const haystack = `${event.strLeague} ${event.strEvent}`.toLowerCase();
  const match = priorityWords.findIndex((word) => haystack.includes(word));
  return match >= 0 ? Math.max(78, 96 - match) : 55;
}

function parseTimestamp(event: ApiEvent) {
  if (event.strTimestamp) return new Date(event.strTimestamp).toISOString();
  return new Date(`${event.dateEvent}T${event.strTime || "00:00:00"}Z`).toISOString();
}

function parseStatus(event: ApiEvent, startsAt: string): SportsEvent["status"] {
  const status = event.strStatus?.toLowerCase() || "";
  if (["match finished", "ft", "finished"].some((value) => status.includes(value))) return "finished";
  if (["live", "1h", "2h", "halftime"].some((value) => status.includes(value))) return "live";
  const diff = Date.now() - new Date(startsAt).getTime();
  if (diff >= 0 && diff < 3 * 60 * 60 * 1000) return "live";
  if (diff >= 3 * 60 * 60 * 1000) return "finished";
  return "upcoming";
}

export async function fetchSportsDbEvents(): Promise<SportsEvent[]> {
  const key = process.env.THESPORTSDB_API_KEY || "123";
  const dates = [0, 1, 2].map((offset) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + offset);
    return date.toISOString().slice(0, 10);
  });
  const batches = await Promise.all(
    dates.map(async (date) => {
      const response = await fetch(
        `https://www.thesportsdb.com/api/v1/json/${key}/eventsday.php?d=${date}`,
        { next: { revalidate: 1800 } },
      );
      if (!response.ok) throw new Error(`TheSportsDB respondió ${response.status}`);
      const body = (await response.json()) as { events?: ApiEvent[] | null };
      return body.events || [];
    }),
  );

  const normalized: SportsEvent[] = batches.flat().filter((event) => event.strHomeTeam && event.strAwayTeam).map((event): SportsEvent => {
    const startsAt = parseTimestamp(event);
    const sport = sportNames[event.strSport] || event.strSport || "Otros";
    const homeSlug = slugify(event.strHomeTeam);
    const awaySlug = slugify(event.strAwayTeam);
    return {
      id: `tsdb-${event.idEvent}`,
      slug: `${homeSlug}-vs-${awaySlug}-${event.idEvent}`,
      sport,
      sportSlug: slugify(sport),
      league: event.strLeague,
      leagueSlug: slugify(event.strLeague),
      home: {
        name: event.strHomeTeam,
        slug: homeSlug,
        logo: event.strHomeTeamBadge,
        score: event.intHomeScore ? Number(event.intHomeScore) : undefined,
      },
      away: {
        name: event.strAwayTeam,
        slug: awaySlug,
        logo: event.strAwayTeamBadge,
        score: event.intAwayScore ? Number(event.intAwayScore) : undefined,
      },
      startsAt,
      status: parseStatus(event, startsAt),
      minute: event.strStatus || undefined,
      venue: event.strVenue || undefined,
      country: event.strCountry || undefined,
      importance: importanceFor(event),
      featured: importanceFor(event) >= 88,
      description: event.strDescriptionEN || undefined,
      source: "thesportsdb",
      updatedAt: new Date().toISOString(),
    };
  });

  const lineupCandidates = normalized
    .filter((event) => event.importance >= 80 || event.status === "live")
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 5);
  await Promise.all(lineupCandidates.map(async (event) => {
    try {
      const eventId = event.id.replace("tsdb-", "");
      const response = await fetch(
        `https://www.thesportsdb.com/api/v1/json/${key}/lookuplineup.php?id=${eventId}`,
        { next: { revalidate: 900 } },
      );
      if (!response.ok) return;
      const body = (await response.json()) as { lineup?: ApiLineup[] | null };
      const starters = (body.lineup || []).filter((player) => player.strSubstitute !== "Yes" && player.strPlayer);
      event.homeLineup = starters.filter((player) => player.strHome === "Yes").map((player) => ({
        name: player.strPlayer || "",
        position: player.strPosition,
        number: player.intSquadNumber,
      }));
      event.awayLineup = starters.filter((player) => player.strHome !== "Yes").map((player) => ({
        name: player.strPlayer || "",
        position: player.strPosition,
        number: player.intSquadNumber,
      }));
    } catch {
      // Lineups are optional and should never block the event sync.
    }
  }));
  return normalized;
}
