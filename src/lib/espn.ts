import type { BroadcastOption, SportsEvent } from "./types";
import { slugify } from "./utils";

type EspnLeague = {
  path: string;
  league: string;
  sport: string;
  importance: number;
  adapter?: "team" | "tennis" | "racing" | "combat" | "golf";
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
  { path: "australian-football/afl", league: "AFL", sport: "Fútbol australiano", importance: 78 },
  { path: "baseball/world-baseball-classic", league: "Clásico Mundial de Béisbol", sport: "Béisbol", importance: 93 },
  { path: "baseball/caribbean-series", league: "Serie del Caribe", sport: "Béisbol", importance: 86 },
  { path: "baseball/mexican-winter-league", league: "Liga Mexicana del Pacífico", sport: "Béisbol", importance: 82 },
  { path: "baseball/dominican-winter-league", league: "LIDOM", sport: "Béisbol", importance: 80 },
  { path: "baseball/venezuelan-winter-league", league: "LVBP", sport: "Béisbol", importance: 78 },
  { path: "basketball/fiba", league: "Copa Mundial FIBA", sport: "Baloncesto", importance: 92 },
  { path: "basketball/nbl", league: "NBL Australia", sport: "Baloncesto", importance: 76 },
  { path: "basketball/nba-development", league: "NBA G League", sport: "Baloncesto", importance: 76 },
  { path: "basketball/mens-olympics-basketball", league: "Baloncesto Olímpico", sport: "Baloncesto", importance: 92 },
  { path: "basketball/womens-olympics-basketball", league: "Baloncesto Olímpico Femenino", sport: "Baloncesto", importance: 88 },
  { path: "football/cfl", league: "CFL", sport: "Fútbol americano", importance: 76 },
  { path: "football/ufl", league: "UFL", sport: "Fútbol americano", importance: 74 },
  { path: "hockey/hockey-world-cup", league: "Copa Mundial de Hockey", sport: "Hockey", importance: 88 },
  { path: "hockey/olympics-mens-ice-hockey", league: "Hockey Olímpico", sport: "Hockey", importance: 91 },
  { path: "hockey/olympics-womens-ice-hockey", league: "Hockey Olímpico Femenino", sport: "Hockey", importance: 86 },
  { path: "cricket/8048", league: "Indian Premier League", sport: "Cricket", importance: 85 },
  { path: "lacrosse/pll", league: "Premier Lacrosse League", sport: "Lacrosse", importance: 72 },
  { path: "lacrosse/nll", league: "National Lacrosse League", sport: "Lacrosse", importance: 70 },
  { path: "rugby/164205", league: "Copa Mundial de Rugby", sport: "Rugby", importance: 94 },
  { path: "rugby/180659", league: "Six Nations", sport: "Rugby", importance: 89 },
  { path: "rugby/244293", league: "The Rugby Championship", sport: "Rugby", importance: 89 },
  { path: "rugby/271937", league: "European Rugby Champions Cup", sport: "Rugby", importance: 84 },
  { path: "rugby/267979", league: "Premiership Rugby", sport: "Rugby", importance: 80 },
  { path: "rugby/270557", league: "United Rugby Championship", sport: "Rugby", importance: 80 },
  { path: "rugby/270559", league: "Top 14", sport: "Rugby", importance: 82 },
  { path: "rugby/242041", league: "Super Rugby Pacific", sport: "Rugby", importance: 82 },
  { path: "rugby/289262", league: "Major League Rugby", sport: "Rugby", importance: 74 },
  { path: "rugby-league/3", league: "Rugby League", sport: "Rugby", importance: 76 },
  { path: "tennis/atp", league: "ATP Tour", sport: "Tenis", importance: 72, adapter: "tennis" },
  { path: "tennis/wta", league: "WTA Tour", sport: "Tenis", importance: 70, adapter: "tennis" },
  { path: "racing/f1", league: "Fórmula 1", sport: "Automovilismo", importance: 88, adapter: "racing" },
  { path: "racing/irl", league: "IndyCar", sport: "Automovilismo", importance: 76, adapter: "racing" },
  { path: "racing/nascar-premier", league: "NASCAR Cup Series", sport: "Automovilismo", importance: 74, adapter: "racing" },
  { path: "mma/ufc", league: "UFC", sport: "MMA", importance: 84, adapter: "combat" },
  { path: "mma/pfl", league: "PFL", sport: "MMA", importance: 74, adapter: "combat" },
  { path: "mma/bellator", league: "Bellator", sport: "MMA", importance: 72, adapter: "combat" },
  { path: "golf/pga", league: "PGA Tour", sport: "Golf", importance: 70, adapter: "golf" },
  { path: "golf/eur", league: "DP World Tour", sport: "Golf", importance: 66, adapter: "golf" },
  { path: "golf/liv", league: "LIV Golf", sport: "Golf", importance: 66, adapter: "golf" },
  { path: "golf/lpga", league: "LPGA", sport: "Golf", importance: 66, adapter: "golf" },
  { path: "golf/champions-tour", league: "PGA Champions Tour", sport: "Golf", importance: 60, adapter: "golf" },
];

/** Ventana más amplia para torneos de selecciones (fases eliminatorias). */
function dateWindowDays(league: EspnLeague) {
  if (league.adapter === "racing" || league.adapter === "golf" || league.adapter === "combat") {
    return { past: 6, future: 21 };
  }
  if (league.adapter === "tennis") return { past: 2, future: 8 };
  if (league.importance >= 97 || league.path.includes("fifa.world") || league.path.includes("fifa.wwc")) {
    return { past: 10, future: 14 };
  }
  return { past: 1, future: 5 };
}

type EspnCompetitor = {
  id?: string;
  order?: number;
  homeAway?: string;
  score?: string;
  winner?: boolean;
  team?: { displayName?: string; logo?: string };
  athlete?: {
    displayName?: string;
    shortName?: string;
    headshot?: { href?: string };
    flag?: { href?: string };
  };
  statistics?: Array<{ name?: string; displayValue?: string; value?: number }>;
};

type EspnBroadcast = {
  type?: { shortName?: string };
  media?: { name?: string; shortName?: string };
  region?: string;
};

type EspnEvent = {
  id: string;
  date: string;
  endDate?: string;
  name?: string;
  shortName?: string;
  major?: boolean;
  venue?: { fullName?: string; address?: { city?: string; country?: string } };
  status?: {
    displayClock?: string;
    type?: { state?: string; shortDetail?: string; completed?: boolean };
  };
  competitions?: Array<{
    id?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    type?: { abbreviation?: string; text?: string; slug?: string };
    venue?: { fullName?: string; address?: { city?: string; country?: string } };
    competitors?: EspnCompetitor[];
    status?: EspnEvent["status"];
    broadcasts?: EspnBroadcast[];
  }>;
  groupings?: Array<{
    grouping?: { slug?: string; displayName?: string };
    competitions?: NonNullable<EspnEvent["competitions"]>;
  }>;
};

const broadcasterUrls: Array<[RegExp, string]> = [
  [/telemundo/i, "https://www.telemundo.com/deportes"],
  [/tudn/i, "https://www.tudn.com/"],
  [/\bvix\b/i, "https://vix.com/"],
  [/disney/i, "https://www.disneyplus.com/"],
  [/\bespn\+?\b/i, "https://www.espn.com/watch/"],
  [/\bfox\b/i, "https://www.foxsports.com/"],
  [/fifa\+?/i, "https://www.plus.fifa.com/"],
  [/dazn/i, "https://www.dazn.com/"],
  [/peacock/i, "https://www.peacocktv.com/sports"],
  [/paramount/i, "https://www.paramountplus.com/"],
  [/apple|mls season pass/i, "https://tv.apple.com/"],
  [/prime video|amazon/i, "https://www.primevideo.com/"],
  [/youtube/i, "https://www.youtube.com/"],
];

function normalizeBroadcasts(items?: EspnBroadcast[]): BroadcastOption[] {
  const unique = new Map<string, BroadcastOption>();
  for (const item of items || []) {
    const name = item.media?.name || item.media?.shortName;
    if (!name) continue;
    const kind = item.type?.shortName?.toLowerCase();
    const type: BroadcastOption["type"] =
      kind === "streaming" ? "streaming" : kind === "radio" ? "radio" : "tv";
    const url = broadcasterUrls.find(([pattern]) => pattern.test(name))?.[1];
    const key = `${name.toLowerCase()}|${item.region || ""}`;
    unique.set(key, { name, type, region: item.region, url });
  }
  return Array.from(unique.values());
}

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

function normalizeScore(score?: string): number | string | undefined {
  if (score === undefined || score === "") return undefined;
  return /^-?\d+(\.\d+)?$/.test(score) ? Number(score) : score;
}

function participantFrom(competitor?: EspnCompetitor, fallback = "Participante") {
  const name = competitor?.team?.displayName || competitor?.athlete?.displayName || fallback;
  return {
    name,
    slug: slugify(name),
    logo: competitor?.team?.logo || competitor?.athlete?.headshot?.href || competitor?.athlete?.flag?.href,
    score: normalizeScore(competitor?.score),
  };
}

function statusFromCompetition(event: EspnEvent, competition?: NonNullable<EspnEvent["competitions"]>[number]) {
  return statusFrom({ ...event, status: competition?.status || event.status });
}

function venueFrom(event: EspnEvent, competition?: NonNullable<EspnEvent["competitions"]>[number]) {
  return competition?.venue || event.venue;
}

function withinRange(iso: string | undefined, range: string) {
  if (!iso) return false;
  const [from, to] = range.split("-");
  const value = new Date(iso).toISOString().slice(0, 10).replace(/-/g, "");
  return value >= from && value <= to;
}

function mapTeamEvent(event: EspnEvent, league: EspnLeague): SportsEvent[] {
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];
  const homeRaw = competitors.find((item) => item.homeAway === "home") || competitors[0];
  const awayRaw = competitors.find((item) => item.homeAway === "away") || competitors[1];
  const home = participantFrom(homeRaw, "");
  const away = participantFrom(awayRaw, "");
  if (!home.name || !away.name) return [];
  const status = statusFromCompetition(event, competition);
  const venue = venueFrom(event, competition);
  return [{
    id: `espn-${slugify(league.path)}-${event.id}`,
    slug: `${home.slug}-vs-${away.slug}-${event.id}`,
    sport: league.sport,
    sportSlug: slugify(league.sport),
    league: league.league,
    leagueSlug: slugify(league.league),
    format: "versus",
    home,
    away,
    startsAt: new Date(competition?.date || competition?.startDate || event.date).toISOString(),
    status,
    minute: status === "live" ? minuteFrom({ ...event, status: competition?.status || event.status }) : undefined,
    venue: venue?.fullName || undefined,
    country: venue?.address?.country || venue?.address?.city || undefined,
    broadcasts: normalizeBroadcasts(competition?.broadcasts),
    importance: status === "live" ? Math.min(100, league.importance + 2) : league.importance,
    featured: league.importance >= 90,
    source: "espn",
    sourceEventId: event.id,
    sourceLeaguePath: league.path,
    updatedAt: new Date().toISOString(),
  }];
}

function mapTennisEvent(event: EspnEvent, league: EspnLeague, range: string): SportsEvent[] {
  const groups = (event.groupings || []).filter((group) => {
    const slug = group.grouping?.slug || "";
    return slug.includes("singles") && !slug.includes("doubles");
  });
  return groups.flatMap((group) => (group.competitions || []).flatMap((competition) => {
    if (!withinRange(competition.date || competition.startDate, range)) return [];
    const competitors = competition.competitors || [];
    if (competitors.length < 2) return [];
    const homeRaw = competitors.find((item) => item.homeAway === "home") || competitors[0];
    const awayRaw = competitors.find((item) => item.homeAway === "away") || competitors[1];
    const home = participantFrom(homeRaw, "");
    const away = participantFrom(awayRaw, "");
    if (!home.name || !away.name) return [];
    const competitionId = competition.id || `${home.slug}-${away.slug}`;
    const status = statusFromCompetition(event, competition);
    const tournament = event.name || league.league;
    const venue = venueFrom(event, competition);
    const item: SportsEvent = {
      id: `espn-${slugify(league.path)}-${event.id}-${competitionId}`,
      slug: `${home.slug}-vs-${away.slug}-${competitionId}`,
      sport: league.sport,
      sportSlug: slugify(league.sport),
      league: tournament,
      leagueSlug: slugify(tournament),
      format: "versus",
      eventName: `${tournament} · ${group.grouping?.displayName || "Singles"}`,
      home,
      away,
      startsAt: new Date(competition.date || competition.startDate || event.date).toISOString(),
      status,
      minute: status === "live" ? minuteFrom({ ...event, status: competition.status }) : undefined,
      venue: venue?.fullName || undefined,
      country: venue?.address?.country || venue?.address?.city || undefined,
      broadcasts: normalizeBroadcasts(competition.broadcasts),
      importance: event.major ? Math.min(88, Math.max(80, league.importance + 8)) : league.importance,
      featured: false,
      source: "espn",
      sourceEventId: event.id,
      sourceCompetitionId: competition.id,
      sourceLeaguePath: league.path,
      updatedAt: new Date().toISOString(),
    };
    return [item];
  }));
}

function mapCombatEvent(event: EspnEvent, league: EspnLeague): SportsEvent[] {
  const competition = [...(event.competitions || [])].reverse().find((item) => (item.competitors?.length || 0) >= 2);
  if (!competition) return [];
  const [homeRaw, awayRaw] = competition.competitors || [];
  const home = participantFrom(homeRaw, "");
  const away = participantFrom(awayRaw, "");
  if (!home.name || !away.name) return [];
  const status = statusFromCompetition(event, competition);
  const venue = venueFrom(event, competition);
  return [{
    id: `espn-${slugify(league.path)}-${event.id}-${competition.id || "main"}`,
    slug: `${home.slug}-vs-${away.slug}-${competition.id || event.id}`,
    sport: league.sport,
    sportSlug: slugify(league.sport),
    league: league.league,
    leagueSlug: slugify(league.league),
    format: "versus",
    eventName: event.name || league.league,
    home,
    away,
    startsAt: new Date(competition.date || competition.startDate || event.date).toISOString(),
    status,
    minute: status === "live" ? minuteFrom({ ...event, status: competition.status }) : undefined,
    venue: venue?.fullName || undefined,
    country: venue?.address?.country || venue?.address?.city || undefined,
    broadcasts: normalizeBroadcasts(competition.broadcasts),
    importance: league.importance,
    featured: league.importance >= 90,
    source: "espn",
    sourceEventId: event.id,
    sourceCompetitionId: competition.id,
    sourceLeaguePath: league.path,
    updatedAt: new Date().toISOString(),
  }];
}

function mapMultiEvent(event: EspnEvent, league: EspnLeague): SportsEvent[] {
  const competition = event.competitions?.[0];
  const raw = [...(competition?.competitors || [])].sort((a, b) => (a.order || 999) - (b.order || 999));
  const ranked = raw.slice(0, 30).map((competitor, index) => ({
    ...participantFrom(competitor),
    position: competitor.order || index + 1,
    isWinner: competitor.winner,
  }));
  const eventName = event.name || event.shortName || league.league;
  const home = ranked[0] || { name: eventName, slug: slugify(eventName) };
  const away = ranked[1] || { name: "Campo", slug: "campo" };
  const status = statusFromCompetition(event, competition);
  const venue = venueFrom(event, competition);
  return [{
    id: `espn-${slugify(league.path)}-${event.id}`,
    slug: `${slugify(eventName)}-${event.id}`,
    sport: league.sport,
    sportSlug: slugify(league.sport),
    league: league.league,
    leagueSlug: slugify(league.league),
    format: "multi",
    eventName,
    participants: ranked,
    home,
    away,
    startsAt: new Date(competition?.date || competition?.startDate || event.date).toISOString(),
    status,
    minute: status === "live" ? minuteFrom({ ...event, status: competition?.status || event.status }) : undefined,
    venue: venue?.fullName || undefined,
    country: venue?.address?.country || venue?.address?.city || undefined,
    broadcasts: normalizeBroadcasts(competition?.broadcasts),
    importance: league.importance,
    featured: league.importance >= 90,
    source: "espn",
    sourceEventId: event.id,
    sourceCompetitionId: competition?.id,
    sourceLeaguePath: league.path,
    updatedAt: new Date().toISOString(),
  }];
}

function mapEspnEvent(event: EspnEvent, league: EspnLeague, range: string) {
  switch (league.adapter) {
    case "tennis": return mapTennisEvent(event, league, range);
    case "combat": return mapCombatEvent(event, league);
    case "racing":
    case "golf": return mapMultiEvent(event, league);
    default: return mapTeamEvent(event, league);
  }
}

async function fetchLeagueRange(league: EspnLeague, range: string): Promise<SportsEvent[]> {
  try {
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${league.path}/scoreboard?dates=${range}&limit=1000`,
      { next: { revalidate: 900 }, headers: { accept: "application/json" } },
    );
    if (!response.ok) return [];
    const body = (await response.json()) as { events?: EspnEvent[] };
    const events = body.events || [];
    return events.flatMap((event) => mapEspnEvent(event, league, range));
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

export function getEspnLeagueCatalog() {
  return leagues.map(({ path, league, sport }) => ({
    path,
    league,
    sport,
    sportSlug: slugify(sport),
  }));
}

export function getEspnSportsCatalog() {
  return Array.from(
    new Map(getEspnLeagueCatalog().map((item) => [item.sportSlug, { slug: item.sportSlug, name: item.sport }])).values(),
  ).sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function fetchEspnResults(path: string, year: number) {
  const league = leagues.find((item) => item.path === path);
  if (!league) return [];
  const ranges = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    const last = new Date(Date.UTC(year, index + 1, 0)).getUTCDate();
    return `${year}${month}01-${year}${month}${String(last).padStart(2, "0")}`;
  });
  const results: SportsEvent[] = [];
  for (let index = 0; index < ranges.length; index += 3) {
    const batch = await Promise.all(ranges.slice(index, index + 3).map((range) => fetchLeagueRange(league, range)));
    results.push(...batch.flat().filter((event) => event.status === "finished"));
  }
  const unique = new Map(results.map((event) => [event.id, event]));
  return Array.from(unique.values()).sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
  );
}

export type EspnLiveUpdate = {
  id: string;
  status: SportsEvent["status"];
  minute?: string;
  homeScore?: number | string;
  awayScore?: number | string;
  participants?: SportsEvent["participants"];
  broadcasts?: BroadcastOption[];
  updatedAt: string;
};

function sourceDetails(event: SportsEvent) {
  const sourceEventId = event.sourceEventId || event.id.match(/-(\d+)$/)?.[1];
  const sourceLeaguePath =
    event.sourceLeaguePath || leagues.find((league) => league.league === event.league)?.path;
  return { sourceEventId, sourceLeaguePath };
}

export async function fetchEspnBroadcasts(event: SportsEvent): Promise<BroadcastOption[]> {
  if (event.source !== "espn") return event.broadcasts || [];
  const { sourceEventId, sourceLeaguePath } = sourceDetails(event);
  if (!sourceEventId || !sourceLeaguePath) return event.broadcasts || [];
  try {
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sourceLeaguePath}/summary?event=${sourceEventId}`,
      { next: { revalidate: 1800 }, headers: { accept: "application/json" } },
    );
    if (!response.ok) return event.broadcasts || [];
    const body = (await response.json()) as {
      broadcasts?: EspnBroadcast[];
      header?: { competitions?: EspnEvent["competitions"] };
    };
    const broadcasts = normalizeBroadcasts(
      body.broadcasts?.length ? body.broadcasts : body.header?.competitions?.[0]?.broadcasts,
    );
    return broadcasts.length ? broadcasts : event.broadcasts || [];
  } catch {
    return event.broadcasts || [];
  }
}

export async function fetchEspnLiveUpdate(event: SportsEvent): Promise<EspnLiveUpdate | null> {
  const { sourceEventId, sourceLeaguePath } = sourceDetails(event);
  if (!sourceEventId || !sourceLeaguePath) return null;
  try {
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sourceLeaguePath}/summary?event=${sourceEventId}`,
      { cache: "no-store", headers: { accept: "application/json" } },
    );
    if (!response.ok) return null;
    const body = (await response.json()) as {
      header?: { competitions?: EspnEvent["competitions"] };
      broadcasts?: EspnBroadcast[];
    };
    const competitions = body.header?.competitions || [];
    const competition =
      competitions.find((item) => item.id === event.sourceCompetitionId) ||
      competitions[0];
    if (!competition) return null;
    const detailEvent: EspnEvent = {
      id: sourceEventId,
      date: event.startsAt,
      status: competition.status,
      competitions: [competition],
    };
    const competitors = competition.competitors || [];
    const home = competitors.find((item) => item.homeAway === "home") || competitors[0];
    const away = competitors.find((item) => item.homeAway === "away") || competitors[1];
    const status = statusFrom(detailEvent);
    return {
      id: event.id,
      status,
      minute: status === "live" ? minuteFrom(detailEvent) : undefined,
      homeScore: normalizeScore(home?.score),
      awayScore: normalizeScore(away?.score),
      participants: event.format === "multi" ? [...competitors]
        .sort((a, b) => (a.order || 999) - (b.order || 999))
        .slice(0, 12)
        .map((competitor, index) => ({
          ...participantFrom(competitor),
          position: competitor.order || index + 1,
          isWinner: competitor.winner,
        })) : undefined,
      broadcasts: normalizeBroadcasts(body.broadcasts?.length ? body.broadcasts : competition.broadcasts),
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
