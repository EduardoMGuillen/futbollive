import type {
  BroadcastOption,
  DetailParticipant,
  EventDetails,
  EventStatus,
  LineupPlayer,
  SportsEvent,
} from "./types";
import { sportLabels } from "./sports";
import { slugify } from "./utils";

const API_BASE = "https://api.pandascore.co";

export type PandaScoreGame = {
  /** Segmento de ruta en la API de PandaScore. */
  path: "valorant" | "lol" | "csgo";
  sport: string;
  sportSlug: string;
  importance: number;
};

export const PANDASCORE_GAMES: PandaScoreGame[] = [
  { path: "valorant", sport: "Valorant", sportSlug: "valorant", importance: 78 },
  { path: "lol", sport: "League of Legends", sportSlug: "league-of-legends", importance: 80 },
  { path: "csgo", sport: "Counter-Strike 2", sportSlug: "cs2", importance: 78 },
];

export function pandascoreGameBySlug(sportSlug: string) {
  return PANDASCORE_GAMES.find((game) => game.sportSlug === sportSlug);
}

export function isPandaScoreConfigured() {
  return Boolean(process.env.PANDASCORE_TOKEN?.trim());
}

type PsOpponent = {
  opponent?: {
    id?: number;
    name?: string;
    slug?: string;
    acronym?: string;
    image_url?: string;
    location?: string;
  };
};

type PsStream = {
  main?: boolean;
  official?: boolean;
  language?: string;
  raw_url?: string;
  embed_url?: string;
};

type PsGame = {
  id?: number;
  position?: number;
  status?: string;
  finished?: boolean;
  begin_at?: string;
  winner?: { id?: number };
};

export type PsMatch = {
  id: number;
  name?: string;
  slug?: string;
  status?: string;
  begin_at?: string;
  scheduled_at?: string;
  original_scheduled_at?: string;
  end_at?: string;
  number_of_games?: number;
  winner_id?: number;
  draw?: boolean;
  forfeit?: boolean;
  results?: Array<{ team_id?: number; player_id?: number; score?: number }>;
  opponents?: PsOpponent[];
  games?: PsGame[];
  streams_list?: PsStream[];
  league?: { id?: number; name?: string; slug?: string; image_url?: string };
  serie?: { id?: number; name?: string; full_name?: string; year?: number };
  tournament?: { id?: number; name?: string; slug?: string; tier?: string };
  videogame?: { name?: string; slug?: string };
};

export type PsPlayer = {
  id?: number;
  name?: string;
  slug?: string;
  first_name?: string;
  last_name?: string;
  nationality?: string;
  role?: string;
  image_url?: string;
  current_team?: PsTeam;
};

export type PsTeam = {
  id?: number;
  name?: string;
  slug?: string;
  acronym?: string;
  image_url?: string;
  location?: string;
  players?: PsPlayer[];
};

async function psFetch<T>(path: string, options?: { fresh?: boolean; revalidate?: number }): Promise<T | null> {
  const token = process.env.PANDASCORE_TOKEN?.trim();
  if (!token) return null;
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { accept: "application/json", authorization: `Bearer ${token}` },
      ...(options?.fresh ? { cache: "no-store" as const } : { next: { revalidate: options?.revalidate ?? 300 } }),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function statusFrom(status?: string): EventStatus {
  if (status === "running") return "live";
  if (status === "finished" || status === "canceled" || status === "forfeit") return "finished";
  return "upcoming";
}

function streamName(stream: PsStream) {
  const url = stream.raw_url || "";
  if (/twitch\.tv/i.test(url)) return "Twitch";
  if (/youtube\.com|youtu\.be/i.test(url)) return "YouTube";
  if (/afreecatv/i.test(url)) return "AfreecaTV";
  if (/kick\.com/i.test(url)) return "Kick";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Stream oficial";
  }
}

function normalizeStreams(streams?: PsStream[]): BroadcastOption[] {
  const unique = new Map<string, BroadcastOption>();
  for (const stream of streams || []) {
    if (!stream.raw_url) continue;
    const name = streamName(stream);
    const key = stream.raw_url.toLowerCase();
    if (unique.has(key)) continue;
    unique.set(key, {
      name: stream.language ? `${name} (${stream.language.toUpperCase()})` : name,
      type: "streaming",
      url: stream.raw_url,
    });
  }
  // Streams principales primero.
  return Array.from(unique.values()).slice(0, 8);
}

function tierBoost(tier?: string) {
  if (tier === "s") return 10;
  if (tier === "a") return 5;
  if (tier === "b") return 0;
  return -4;
}

function seriesLabel(match: PsMatch) {
  const parts = [match.league?.name, match.serie?.full_name || match.serie?.name].filter(Boolean);
  return parts.join(" ") || "Esports";
}

function scoreFor(match: PsMatch, teamId?: number) {
  if (teamId === undefined) return undefined;
  const entry = match.results?.find((item) => item.team_id === teamId || item.player_id === teamId);
  return entry?.score;
}

function liveMinute(match: PsMatch) {
  const total = match.number_of_games;
  const finished = (match.games || []).filter((game) => game.finished || game.status === "finished").length;
  const current = Math.min(finished + 1, total || finished + 1);
  return total ? `Mapa ${current} · BO${total}` : `Mapa ${current}`;
}

export function mapPandaScoreMatch(match: PsMatch, game: PandaScoreGame): SportsEvent | null {
  const opponents = match.opponents || [];
  const homeRaw = opponents[0]?.opponent;
  const awayRaw = opponents[1]?.opponent;
  if (!homeRaw?.name || !awayRaw?.name) return null;
  if (match.status === "canceled") return null;
  const startsAtIso = match.begin_at || match.scheduled_at || match.original_scheduled_at;
  if (!startsAtIso) return null;
  const status = statusFrom(match.status);
  const home = {
    name: homeRaw.name,
    slug: slugify(homeRaw.name),
    logo: homeRaw.image_url || undefined,
    score: scoreFor(match, homeRaw.id),
  };
  const away = {
    name: awayRaw.name,
    slug: slugify(awayRaw.name),
    logo: awayRaw.image_url || undefined,
    score: scoreFor(match, awayRaw.id),
  };
  const league = seriesLabel(match);
  const tournament = match.tournament?.name;
  const importance = Math.max(50, Math.min(92, game.importance + tierBoost(match.tournament?.tier)));
  return {
    id: `pandascore-${game.sportSlug}-${match.id}`,
    slug: `${home.slug}-vs-${away.slug}-ps${match.id}`,
    sport: game.sport,
    sportSlug: game.sportSlug,
    league,
    leagueSlug: slugify(`${game.sportSlug}-${league}`),
    format: "versus",
    eventName: tournament ? `${league} · ${tournament}` : league,
    home,
    away,
    startsAt: new Date(startsAtIso).toISOString(),
    status,
    minute: status === "live" ? liveMinute(match) : undefined,
    venue: undefined,
    country: "Online",
    broadcasts: normalizeStreams(match.streams_list),
    bestOf: match.number_of_games,
    importance,
    featured: match.tournament?.tier === "s",
    source: "pandascore",
    sourceEventId: String(match.id),
    sourceLeaguePath: game.path,
    updatedAt: new Date().toISOString(),
  };
}

async function fetchGameMatches(game: PandaScoreGame): Promise<SportsEvent[]> {
  const [upcoming, running, past] = await Promise.all([
    psFetch<PsMatch[]>(`/${game.path}/matches/upcoming?per_page=50&sort=begin_at`, { fresh: true }),
    psFetch<PsMatch[]>(`/${game.path}/matches/running?per_page=50`, { fresh: true }),
    psFetch<PsMatch[]>(`/${game.path}/matches/past?per_page=25&sort=-end_at`, { fresh: true }),
  ]);
  const matches = [...(running || []), ...(upcoming || []), ...(past || [])];
  const events = matches
    .map((match) => mapPandaScoreMatch(match, game))
    .filter((event): event is SportsEvent => Boolean(event));
  const unique = new Map(events.map((event) => [event.id, event]));
  return Array.from(unique.values());
}

/** Trae partidos en vivo, próximos y recientes de Valorant, LoL y CS2. */
export async function fetchPandaScoreEvents(): Promise<SportsEvent[]> {
  if (!isPandaScoreConfigured()) return [];
  const batches = await Promise.all(PANDASCORE_GAMES.map(fetchGameMatches));
  return batches.flat();
}

export type PandaScoreLiveUpdate = {
  id: string;
  status: SportsEvent["status"];
  minute?: string;
  homeScore?: number | string;
  awayScore?: number | string;
  participants?: SportsEvent["participants"];
  broadcasts?: BroadcastOption[];
  updatedAt: string;
};

function updateFromMatch(event: SportsEvent, match: PsMatch): PandaScoreLiveUpdate {
  const status = statusFrom(match.status);
  const opponents = match.opponents || [];
  const homeRaw = opponents.find((item) => slugify(item.opponent?.name || "") === event.home.slug)?.opponent || opponents[0]?.opponent;
  const awayRaw = opponents.find((item) => slugify(item.opponent?.name || "") === event.away.slug)?.opponent || opponents[1]?.opponent;
  return {
    id: event.id,
    status,
    minute: status === "live" ? liveMinute(match) : undefined,
    homeScore: scoreFor(match, homeRaw?.id),
    awayScore: scoreFor(match, awayRaw?.id),
    broadcasts: normalizeStreams(match.streams_list),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Actualiza estado y marcador de serie de los eventos candidatos.
 * Una sola llamada bulk a /matches/running + consultas puntuales para cierres.
 */
export async function updatePandaScoreLiveEvents(candidates: SportsEvent[]): Promise<PandaScoreLiveUpdate[]> {
  if (!candidates.length || !isPandaScoreConfigured()) return [];
  const running = (await psFetch<PsMatch[]>("/matches/running?per_page=100", { fresh: true })) || [];
  const runningById = new Map(running.map((match) => [String(match.id), match]));
  const updates: PandaScoreLiveUpdate[] = [];
  const missing: SportsEvent[] = [];
  for (const event of candidates) {
    const match = event.sourceEventId ? runningById.get(event.sourceEventId) : undefined;
    if (match) updates.push(updateFromMatch(event, match));
    else if (event.status === "live") missing.push(event);
  }
  // Eventos que estaban en vivo y ya no aparecen como running: buscar resultado final.
  const closures = await Promise.all(
    missing.slice(0, 10).map(async (event) => {
      const match = await psFetch<PsMatch>(`/matches/${event.sourceEventId}`, { fresh: true });
      return match ? updateFromMatch(event, match) : null;
    }),
  );
  updates.push(...closures.filter((update): update is PandaScoreLiveUpdate => Boolean(update)));
  return updates;
}

function rosterFromTeam(team?: PsTeam | null): LineupPlayer[] {
  return (team?.players || []).slice(0, 12).map((player) => ({
    name: player.name || [player.first_name, player.last_name].filter(Boolean).join(" ") || "Jugador",
    position: player.role || undefined,
    nationality: player.nationality || undefined,
    photo: player.image_url || undefined,
    slug: player.slug || undefined,
  }));
}

function detailParticipant(event: SportsEvent, side: "home" | "away", raw?: PsOpponent["opponent"], score?: number): DetailParticipant {
  const base = side === "home" ? event.home : event.away;
  return {
    id: raw?.id ? String(raw.id) : base.slug,
    name: raw?.name || base.name,
    shortName: raw?.acronym || undefined,
    slug: raw?.name ? slugify(raw.name) : base.slug,
    side,
    logo: raw?.image_url || base.logo,
    score: score ?? base.score,
    kind: "team",
  };
}

/** Detalles de la serie: mapas, estado, streams y rosters de ambos equipos. */
export async function fetchPandaScoreEventDetails(event: SportsEvent): Promise<EventDetails> {
  const labels = sportLabels(event);
  const fallback: EventDetails = {
    eventId: event.id,
    family: "team",
    status: { state: event.status, label: event.minute, clock: event.minute },
    participants: [
      { id: event.home.slug, name: event.home.name, slug: event.home.slug, logo: event.home.logo, score: event.home.score, side: "home", kind: "team" },
      { id: event.away.slug, name: event.away.name, slug: event.away.slug, logo: event.away.logo, score: event.away.score, side: "away", kind: "team" },
    ],
    labels,
    broadcasts: event.broadcasts,
    updatedAt: new Date().toISOString(),
  };
  if (!event.sourceEventId || !isPandaScoreConfigured()) return fallback;
  const match = await psFetch<PsMatch>(`/matches/${event.sourceEventId}`, { fresh: true });
  if (!match) return fallback;

  const opponents = match.opponents || [];
  const homeRaw = opponents[0]?.opponent;
  const awayRaw = opponents[1]?.opponent;
  const home = detailParticipant(event, "home", homeRaw, scoreFor(match, homeRaw?.id));
  const away = detailParticipant(event, "away", awayRaw, scoreFor(match, awayRaw?.id));
  const status = statusFrom(match.status);

  const segments = (match.games || [])
    .filter((game) => game.finished || game.status === "finished")
    .map((game, index) => ({
      key: `map-${game.position || index + 1}`,
      label: `Mapa ${game.position || index + 1}`,
      scores: [home, away].map((participant) => ({
        participantId: participant.id,
        value: game.winner?.id && String(game.winner.id) === participant.id ? "✓" : "–",
      })),
    }));

  const [homeTeam, awayTeam] = await Promise.all([
    homeRaw?.id ? psFetch<PsTeam>(`/teams/${homeRaw.id}`, { revalidate: 3600 }) : null,
    awayRaw?.id ? psFetch<PsTeam>(`/teams/${awayRaw.id}`, { revalidate: 3600 }) : null,
  ]);
  const lineups = [
    { participantId: home.id, participantName: home.name, players: rosterFromTeam(homeTeam) },
    { participantId: away.id, participantName: away.name, players: rosterFromTeam(awayTeam) },
  ].filter((item) => item.players.length > 0);

  return {
    eventId: event.id,
    family: "team",
    status: {
      state: status,
      label: status === "live" ? liveMinute(match) : match.status === "finished" ? "Finalizado" : undefined,
    },
    roundLabel: [match.tournament?.name, match.number_of_games ? `BO${match.number_of_games}` : null]
      .filter(Boolean)
      .join(" · ") || undefined,
    participants: [home, away],
    segments: segments.length ? segments : undefined,
    lineups: lineups.length ? lineups : undefined,
    labels,
    broadcasts: normalizeStreams(match.streams_list).length
      ? normalizeStreams(match.streams_list)
      : event.broadcasts,
    updatedAt: new Date().toISOString(),
  };
}

/** Resultados históricos bajo demanda para la sección Resultados. */
export async function fetchPandaScoreResults(gamePath: string, year: number): Promise<SportsEvent[]> {
  const game = PANDASCORE_GAMES.find((item) => item.path === gamePath);
  if (!game || !isPandaScoreConfigured()) return [];
  const range = `${year}-01-01T00:00:00Z,${year}-12-31T23:59:59Z`;
  const pages = await Promise.all([1, 2, 3].map((page) =>
    psFetch<PsMatch[]>(
      `/${game.path}/matches/past?range[begin_at]=${encodeURIComponent(range)}&sort=-begin_at&per_page=100&page=${page}`,
      { revalidate: 3600 },
    ),
  ));
  const events = pages
    .flatMap((batch) => batch || [])
    .map((match) => mapPandaScoreMatch(match, game))
    .filter((event): event is SportsEvent => Boolean(event) && event!.status === "finished");
  const unique = new Map(events.map((event) => [event.id, event]));
  return Array.from(unique.values()).sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
  );
}

/** Catálogo para los filtros de la sección Resultados. */
export function getPandaScoreCatalog() {
  return PANDASCORE_GAMES.map((game) => ({
    path: `pandascore:${game.path}`,
    league: `${game.sport} (todos los torneos)`,
    sport: game.sport,
    sportSlug: game.sportSlug,
  }));
}

export async function fetchPandaScoreTeam(gamePath: string, slug: string): Promise<PsTeam | null> {
  if (!isPandaScoreConfigured()) return null;
  const teams = await psFetch<PsTeam[]>(
    `/${gamePath}/teams?filter[slug]=${encodeURIComponent(slug)}&per_page=1`,
    { revalidate: 1800 },
  );
  if (teams?.length) return teams[0];
  // Fallback: búsqueda por nombre (los slugs propios pueden diferir de los de PandaScore).
  const byName = await psFetch<PsTeam[]>(
    `/${gamePath}/teams?search[name]=${encodeURIComponent(slug.replace(/-/g, " "))}&per_page=5`,
    { revalidate: 1800 },
  );
  return byName?.find((team) => slugify(team.name || "") === slug) || byName?.[0] || null;
}

export async function fetchPandaScorePlayer(gamePath: string, slug: string): Promise<PsPlayer | null> {
  if (!isPandaScoreConfigured()) return null;
  const players = await psFetch<PsPlayer[]>(
    `/${gamePath}/players?filter[slug]=${encodeURIComponent(slug)}&per_page=1`,
    { revalidate: 1800 },
  );
  if (players?.length) return players[0];
  const byName = await psFetch<PsPlayer[]>(
    `/${gamePath}/players?search[name]=${encodeURIComponent(slug.replace(/-/g, " "))}&per_page=5`,
    { revalidate: 1800 },
  );
  return byName?.find((player) => slugify(player.name || "") === slug) || byName?.[0] || null;
}
