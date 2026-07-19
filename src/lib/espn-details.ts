import type {
  BroadcastOption,
  DetailParticipant,
  EventContest,
  EventDetails,
  EventSegment,
  EventStatus,
  LineupPlayer,
  SportsEvent,
  StandingEntry,
  StatisticGroup,
  StatisticValue,
  TimelineEntry,
} from "./types";
import { sportFamily, sportLabels } from "./sports";
import { slugify } from "./utils";

type EspnStat = {
  name?: string;
  abbreviation?: string;
  label?: string;
  displayValue?: string;
  value?: number | string;
  rank?: number;
};

type EspnAthlete = {
  id?: string;
  displayName?: string;
  shortName?: string;
  jersey?: string;
  headshot?: { href?: string };
  flag?: { href?: string };
  position?: { abbreviation?: string; displayName?: string };
};

type EspnCompetitor = {
  id?: string;
  order?: number;
  homeAway?: string;
  score?: string;
  winner?: boolean;
  type?: string;
  team?: {
    id?: string;
    displayName?: string;
    shortDisplayName?: string;
    logo?: string;
    logos?: Array<{ href?: string; rel?: string[] }>;
  };
  athlete?: EspnAthlete;
  statistics?: EspnStat[];
  linescores?: Array<{ value?: number | string; displayValue?: string }>;
  records?: Array<{ type?: string; summary?: string; displayValue?: string }>;
};

type EspnBroadcast = {
  type?: { shortName?: string };
  media?: { name?: string; shortName?: string };
  region?: string;
};

type EspnCompetition = {
  id?: string;
  date?: string;
  startDate?: string;
  type?: { abbreviation?: string; text?: string; slug?: string };
  round?: { displayName?: string; id?: string };
  venue?: { fullName?: string; address?: { city?: string; country?: string }; court?: string };
  competitors?: EspnCompetitor[];
  status?: {
    displayClock?: string;
    period?: number;
    type?: { state?: string; shortDetail?: string; detail?: string; completed?: boolean };
  };
  broadcasts?: EspnBroadcast[];
  notes?: Array<{ text?: string; type?: string; headline?: string }>;
};

type EspnSummary = {
  broadcasts?: EspnBroadcast[];
  header?: {
    competitions?: EspnCompetition[];
    season?: { year?: number };
  };
  boxscore?: {
    teams?: Array<{
      team?: { id?: string; displayName?: string };
      statistics?: EspnStat[] | Array<{ name?: string; displayName?: string; stats?: EspnStat[] }>;
    }>;
    players?: Array<{
      team?: { id?: string; displayName?: string };
      statistics?: Array<{
        name?: string;
        displayName?: string;
        labels?: string[];
        names?: string[];
        athletes?: Array<{
          athlete?: EspnAthlete;
          stats?: Array<string | number>;
        }>;
      }>;
    }>;
  };
  leaders?: Array<{
    name?: string;
    displayName?: string;
    team?: { id?: string; displayName?: string };
    leaders?: Array<{
      name?: string;
      displayName?: string;
      leaders?: Array<{
        displayValue?: string;
        athlete?: EspnAthlete;
        team?: { id?: string; displayName?: string };
      }>;
    }>;
  }>;
  rosters?: Array<{
    homeAway?: string;
    team?: { id?: string; displayName?: string };
    roster?: Array<{
      athlete?: EspnAthlete;
      jersey?: string;
      position?: { abbreviation?: string; displayName?: string };
      starter?: boolean;
    }>;
  }>;
  plays?: Array<{
    id?: string;
    text?: string;
    shortText?: string;
    clock?: { displayValue?: string };
    period?: { number?: number };
  }>;
  keyEvents?: Array<{
    id?: string;
    type?: { id?: string; text?: string };
    text?: string;
    shortText?: string;
    clock?: { displayValue?: string };
    period?: { number?: number; displayValue?: string };
    team?: { id?: string; displayName?: string };
    participants?: Array<{ athlete?: EspnAthlete }>;
    scoringPlay?: boolean;
  }>;
  scoringPlays?: Array<{
    id?: string;
    type?: { text?: string; abbreviation?: string };
    text?: string;
    clock?: { displayValue?: string };
    period?: { number?: number };
    team?: { id?: string; displayName?: string };
    homeScore?: number;
    awayScore?: number;
  }>;
  predictor?: {
    homeTeam?: { gameProjection?: string | number; teamChanceToWin?: string | number };
    awayTeam?: { gameProjection?: string | number; teamChanceToWin?: string | number };
  };
  winprobability?: Array<{
    homeWinPercentage?: number;
    tiePercentage?: number;
  }>;
  gameInfo?: {
    venue?: { fullName?: string };
  };
};

type EspnScoreboardBody = {
  events?: Array<{
    id: string;
    name?: string;
    shortName?: string;
    date?: string;
    status?: EspnCompetition["status"];
    competitions?: EspnCompetition[];
    groupings?: Array<{
      grouping?: { slug?: string; displayName?: string };
      competitions?: EspnCompetition[];
    }>;
    venue?: EspnCompetition["venue"];
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
    unique.set(`${name.toLowerCase()}|${item.region || ""}`, { name, type, region: item.region, url });
  }
  return Array.from(unique.values());
}

function statusFrom(state?: string): EventStatus {
  if (state === "in") return "live";
  if (state === "post") return "finished";
  return "upcoming";
}

function normalizeScore(score?: string | number): number | string | undefined {
  if (score === undefined || score === "") return undefined;
  const value = String(score);
  return /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value;
}

function pct(value?: string | number) {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  if (!Number.isFinite(number)) return undefined;
  return number <= 1 ? Math.round(number * 1000) / 10 : Math.round(number * 10) / 10;
}

function competitorLogo(competitor?: EspnCompetitor) {
  if (!competitor) return undefined;
  const defaultLogo = competitor.team?.logos?.find((item) => item.rel?.includes("default") && !item.rel?.includes("dark"));
  return (
    competitor.team?.logo ||
    defaultLogo?.href ||
    competitor.team?.logos?.[0]?.href ||
    competitor.athlete?.headshot?.href ||
    competitor.athlete?.flag?.href
  );
}

function participantFrom(competitor?: EspnCompetitor): DetailParticipant | null {
  const name = competitor?.team?.displayName || competitor?.athlete?.displayName;
  if (!name || !competitor) return null;
  const id = competitor.id || competitor.team?.id || competitor.athlete?.id || slugify(name);
  return {
    id: String(id),
    name,
    shortName: competitor.team?.shortDisplayName || competitor.athlete?.shortName,
    slug: slugify(name),
    side: competitor.homeAway === "away" ? "away" : competitor.homeAway === "home" ? "home" : undefined,
    logo: competitorLogo(competitor),
    score: normalizeScore(competitor.score),
    winner: competitor.winner,
    kind: competitor.athlete || competitor.type === "athlete" ? "athlete" : "team",
    statistics: (competitor.statistics || [])
      .filter((item) => item.displayValue !== undefined && item.displayValue !== "")
      .map((item) => ({
        key: item.name || item.abbreviation || item.label || "stat",
        label: item.label || item.abbreviation || item.name || "Estadística",
        displayValue: String(item.displayValue),
        value: item.value,
        participantId: String(id),
        rank: item.rank,
      })),
  };
}

function flattenTeamStats(raw?: EspnSummary["boxscore"]): StatisticGroup[] {
  const groups: StatisticGroup[] = [];
  for (const team of raw?.teams || []) {
    const participantId = team.team?.id ? String(team.team.id) : undefined;
    const participantName = team.team?.displayName;
    const stats = team.statistics;
    if (!stats?.length) continue;
    // Flat team statistics (NBA/soccer style).
    if ("displayValue" in (stats[0] || {}) || "abbreviation" in (stats[0] || {})) {
      const values = (stats as EspnStat[])
        .filter((item) => item.displayValue !== undefined && item.displayValue !== "")
        .map((item) => ({
          key: item.name || item.abbreviation || item.label || "stat",
          label: item.label || item.abbreviation || item.name || "Estadística",
          displayValue: String(item.displayValue),
          value: item.value,
          participantId,
        }));
      if (values.length) {
        groups.push({
          key: `team-${participantId || participantName || "stats"}`,
          label: participantName || "Equipo",
          participantId,
          participantName,
          statistics: values,
        });
      }
      continue;
    }
    // Grouped statistics (MLB batting/pitching/fielding).
    for (const group of stats as Array<{ name?: string; displayName?: string; stats?: EspnStat[] }>) {
      const values = (group.stats || [])
        .filter((item) => item.displayValue !== undefined && item.displayValue !== "")
        .map((item) => ({
          key: item.name || item.abbreviation || item.label || "stat",
          label: item.label || item.abbreviation || item.name || "Estadística",
          displayValue: String(item.displayValue),
          value: item.value,
          participantId,
        }));
      if (!values.length) continue;
      groups.push({
        key: `team-${participantId || "x"}-${group.name || group.displayName || "group"}`,
        label: `${participantName || "Equipo"} · ${group.displayName || group.name || "Estadísticas"}`,
        participantId,
        participantName,
        statistics: values,
      });
    }
  }
  return groups;
}

function playerStatGroups(raw?: EspnSummary["boxscore"]): StatisticGroup[] {
  const groups: StatisticGroup[] = [];
  for (const teamBlock of raw?.players || []) {
    for (const group of teamBlock.statistics || []) {
      const values: StatisticValue[] = [];
      for (const row of group.athletes || []) {
        const athleteName = row.athlete?.displayName;
        if (!athleteName || !row.stats?.length) continue;
        const labels = group.labels?.length ? group.labels : group.names || [];
        row.stats.forEach((stat, index) => {
          if (stat === undefined || stat === "" || stat === null) return;
          const label = labels[index] || `Stat ${index + 1}`;
          values.push({
            key: `${slugify(athleteName)}-${label}`,
            label: `${athleteName} · ${label}`,
            displayValue: String(stat),
            participantId: row.athlete?.id,
          });
        });
      }
      if (!values.length) continue;
      groups.push({
        key: `players-${teamBlock.team?.id || "team"}-${group.name || group.displayName || "stats"}`,
        label: `${teamBlock.team?.displayName || "Equipo"} · ${group.displayName || group.name || "Jugadores"}`,
        participantId: teamBlock.team?.id,
        participantName: teamBlock.team?.displayName,
        statistics: values.slice(0, 40),
      });
    }
  }
  return groups;
}

function leaderGroups(raw?: EspnSummary["leaders"]): StatisticGroup[] {
  const groups: StatisticGroup[] = [];
  (raw || []).forEach((category, categoryIndex) => {
    // Soccer nests leaders per team; the team name disambiguates repeated category names.
    const teamName = category.team?.displayName;
    (category.leaders || []).forEach((leaderCategory, leaderIndex) => {
      const values = (leaderCategory.leaders || [])
        .filter((item) => item.athlete?.displayName && item.displayValue)
        .map((item, index) => ({
          key: `${leaderCategory.name || "leader"}-${item.athlete?.id || index}-${index}`,
          label: item.athlete?.displayName || "Atleta",
          displayValue: String(item.displayValue),
          participantId: item.athlete?.id || item.team?.id,
          rank: index + 1,
        }));
      if (!values.length) return;
      const baseLabel = leaderCategory.displayName || category.displayName || category.name || "Líderes";
      groups.push({
        key: `leaders-${categoryIndex}-${leaderIndex}-${leaderCategory.name || leaderCategory.displayName || "lead"}`,
        label: teamName ? `${teamName} · ${baseLabel}` : baseLabel,
        participantId: category.team?.id,
        participantName: teamName,
        statistics: values,
      });
    });
  });
  return groups;
}

function buildSegments(competitors: DetailParticipant[], competition?: EspnCompetition, family?: EventDetails["family"]): EventSegment[] {
  const withLines = (competition?.competitors || []).filter((item) => item.linescores?.length);
  if (!withLines.length) return [];
  const max = Math.max(...withLines.map((item) => item.linescores?.length || 0));
  const labelFor = (index: number) => {
    if (family === "tennis") return `Set ${index + 1}`;
    if (family === "team") {
      // Heuristic: baseball often has 9+, basketball/football 4.
      if (max >= 8) return `E${index + 1}`;
      return `P${index + 1}`;
    }
    return `${index + 1}`;
  };
  return Array.from({ length: max }, (_, index) => ({
    key: `segment-${index + 1}`,
    label: labelFor(index),
    scores: withLines.flatMap((competitor) => {
      const participant = competitors.find((item) => item.id === String(competitor.id || competitor.team?.id || competitor.athlete?.id));
      const line = competitor.linescores?.[index];
      if (!participant || (line?.value === undefined && line?.displayValue === undefined)) return [];
      return [{
        participantId: participant.id,
        value: line.displayValue ?? line.value ?? "",
      }];
    }),
  })).filter((segment) => segment.scores.length > 0);
}

function buildLineups(raw?: EspnSummary["rosters"], event?: SportsEvent): EventDetails["lineups"] {
  if (!raw?.length) {
    if (!event?.homeLineup?.length && !event?.awayLineup?.length) return undefined;
    return [
      event.homeLineup?.length ? {
        participantId: event.home.slug,
        participantName: event.home.name,
        players: event.homeLineup,
      } : null,
      event.awayLineup?.length ? {
        participantId: event.away.slug,
        participantName: event.away.name,
        players: event.awayLineup,
      } : null,
    ].filter(Boolean) as EventDetails["lineups"];
  }
  return raw.map((roster) => {
    const players: LineupPlayer[] = (roster.roster || [])
      .filter((item) => item.athlete?.displayName)
      .slice(0, 25)
      .map((item) => ({
        name: item.athlete!.displayName!,
        number: item.jersey || item.athlete?.jersey,
        position: item.position?.abbreviation || item.athlete?.position?.abbreviation || item.position?.displayName,
      }));
    return {
      participantId: roster.team?.id || roster.homeAway || "team",
      participantName: roster.team?.displayName || (roster.homeAway === "home" ? "Local" : "Visitante"),
      players,
    };
  }).filter((item) => item.players.length > 0);
}

/** Traducción de tipos de incidencia de ESPN al español. */
function timelineLabel(typeText?: string): { label: string; scoring: boolean } | null {
  if (!typeText) return null;
  if (/own goal/i.test(typeText)) return { label: "Autogol", scoring: true };
  if (/penalty.*(scored|goal)/i.test(typeText)) return { label: "Gol de penal", scoring: true };
  if (/penalty.*(missed|saved)/i.test(typeText)) return { label: "Penal fallado", scoring: false };
  if (/shootout/i.test(typeText)) return { label: "Penal (definición)", scoring: true };
  if (/goal|score/i.test(typeText)) return { label: "Gol", scoring: true };
  if (/yellow card/i.test(typeText)) return { label: "Tarjeta amarilla", scoring: false };
  if (/red card/i.test(typeText)) return { label: "Tarjeta roja", scoring: false };
  if (/substitution/i.test(typeText)) return { label: "Cambio", scoring: false };
  if (/touchdown/i.test(typeText)) return { label: "Touchdown", scoring: true };
  if (/field goal/i.test(typeText)) return { label: "Gol de campo", scoring: true };
  if (/safety/i.test(typeText)) return { label: "Safety", scoring: true };
  return null;
}

/**
 * Cronología estructurada: goles con minuto, autor y asistencia, tarjetas y
 * anotaciones equivalentes en otros deportes. Solo incluye lo que ESPN reporta.
 */
function buildTimeline(summary: EspnSummary, competition?: EspnCompetition): TimelineEntry[] {
  const teamNames = new Map<string, string>();
  for (const competitor of competition?.competitors || []) {
    if (competitor.team?.id) teamNames.set(String(competitor.team.id), competitor.team.displayName || "");
  }
  const entries: TimelineEntry[] = [];

  for (const item of summary.keyEvents || []) {
    const mapped = timelineLabel(item.type?.text);
    if (!mapped) continue;
    const players = (item.participants || [])
      .map((participant) => participant.athlete?.displayName)
      .filter((name): name is string => Boolean(name));
    const teamId = item.team?.id ? String(item.team.id) : undefined;
    entries.push({
      id: item.id || `${item.type?.text}-${item.clock?.displayValue || entries.length}`,
      label: mapped.label,
      minute: item.clock?.displayValue,
      period: item.period?.number,
      text: item.text || item.shortText,
      player: players[0],
      assist: mapped.scoring && mapped.label !== "Autogol" ? players[1] : undefined,
      participantId: teamId,
      teamName: item.team?.displayName || (teamId ? teamNames.get(teamId) : undefined),
      scoring: mapped.scoring,
    });
  }

  if (!entries.length) {
    for (const play of summary.scoringPlays || []) {
      entries.push({
        id: play.id || `scoring-${entries.length}`,
        label: timelineLabel(play.type?.text)?.label || play.type?.text || "Anotación",
        minute: play.clock?.displayValue,
        period: play.period?.number,
        text: play.text,
        participantId: play.team?.id ? String(play.team.id) : undefined,
        teamName: play.team?.displayName || (play.team?.id ? teamNames.get(String(play.team.id)) : undefined),
        scoring: true,
      });
    }
  }
  return entries.slice(-40);
}

function buildPredictor(summary?: EspnSummary) {
  const homePct = pct(summary?.predictor?.homeTeam?.gameProjection ?? summary?.predictor?.homeTeam?.teamChanceToWin);
  const awayPct = pct(summary?.predictor?.awayTeam?.gameProjection ?? summary?.predictor?.awayTeam?.teamChanceToWin);
  if (homePct !== undefined || awayPct !== undefined) {
    return { homePct, awayPct, label: "Probabilidad estimada (ESPN)" };
  }
  const last = summary?.winprobability?.at(-1);
  if (!last || last.homeWinPercentage === undefined) return undefined;
  return {
    homePct: pct(last.homeWinPercentage),
    awayPct: pct(1 - (last.homeWinPercentage || 0) - (last.tiePercentage || 0)),
    tiePct: pct(last.tiePercentage),
    label: "Probabilidad en vivo (ESPN)",
  };
}

function buildContests(competitions: EspnCompetition[]): EventContest[] {
  return competitions
    .filter((item) => (item.competitors?.length || 0) >= 2)
    .map((competition, index) => {
      const participants = (competition.competitors || [])
        .map(participantFrom)
        .filter((item): item is DetailParticipant => Boolean(item));
      const winner = participants.find((item) => item.winner);
      const note = competition.notes?.map((item) => item.text || item.headline).filter(Boolean).join(" · ");
      return {
        id: competition.id || `bout-${index}`,
        label: competition.type?.text || competition.round?.displayName || `Combate ${index + 1}`,
        order: index + 1,
        weightClass: competition.type?.text || competition.type?.abbreviation,
        status: competition.status?.type?.shortDetail || competition.status?.type?.detail,
        participants,
        result: winner || note ? {
          winnerId: winner?.id,
          displayValue: note || (winner ? `Ganador: ${winner.name}` : undefined),
          method: note,
        } : undefined,
      };
    });
}

function buildStandings(competitors: EspnCompetitor[]): StandingEntry[] {
  return [...competitors]
    .sort((a, b) => (a.order || 999) - (b.order || 999))
    .flatMap((competitor, index) => {
      const participant = participantFrom(competitor);
      if (!participant) return [];
      const metrics = (competitor.statistics || [])
        .filter((item) => item.displayValue !== undefined && item.displayValue !== "")
        .map((item) => ({
          key: item.name || item.abbreviation || item.label || "metric",
          label: item.label || item.abbreviation || item.name || "Dato",
          displayValue: String(item.displayValue),
          value: item.value,
        }));
      return [{
        position: competitor.order || index + 1,
        participant,
        score: participant.score,
        metrics: metrics.length ? metrics : undefined,
      }];
    });
}

function emptyDetails(event: SportsEvent): EventDetails {
  const family = sportFamily(event);
  return {
    eventId: event.id,
    family,
    status: {
      state: event.status,
      label: event.minute,
      clock: event.minute,
    },
    participants: [
      {
        id: event.home.slug,
        name: event.home.name,
        slug: event.home.slug,
        logo: event.home.logo,
        score: event.home.score,
        side: "home",
        kind: family === "team" ? "team" : "athlete",
      },
      {
        id: event.away.slug,
        name: event.away.name,
        slug: event.away.slug,
        logo: event.away.logo,
        score: event.away.score,
        side: "away",
        kind: family === "team" ? "team" : "athlete",
      },
    ],
    standings: event.participants?.map((participant, index) => ({
      position: participant.position || index + 1,
      participant: {
        id: participant.slug,
        name: participant.name,
        slug: participant.slug,
        logo: participant.logo,
        score: participant.score,
        winner: participant.isWinner,
        kind: "athlete",
      },
      score: participant.score,
    })),
    lineups: buildLineups(undefined, event),
    labels: sportLabels(event),
    broadcasts: event.broadcasts,
    updatedAt: new Date().toISOString(),
  };
}

async function fetchJson<T>(url: string, revalidate = 120): Promise<T | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate },
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchJsonFresh<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function detailsFromSummary(event: SportsEvent, summary: EspnSummary): EventDetails {
  const family = sportFamily(event);
  const competition =
    summary.header?.competitions?.find((item) => item.id === event.sourceCompetitionId) ||
    summary.header?.competitions?.[0];
  const competitors = (competition?.competitors || [])
    .map(participantFrom)
    .filter((item): item is DetailParticipant => Boolean(item));
  const statusState = statusFrom(competition?.status?.type?.state);
  const teamStats = flattenTeamStats(summary.boxscore);
  const playerStats = playerStatGroups(summary.boxscore);
  return {
    eventId: event.id,
    family,
    status: {
      state: statusState,
      label: competition?.status?.type?.shortDetail || competition?.status?.type?.detail,
      clock: competition?.status?.displayClock,
      period: competition?.status?.period,
    },
    roundLabel: competition?.round?.displayName || competition?.type?.text,
    participants: competitors.length ? competitors : emptyDetails(event).participants,
    segments: buildSegments(competitors, competition, family),
    statisticGroups: [...teamStats, ...playerStats],
    leaders: leaderGroups(summary.leaders),
    lineups: buildLineups(summary.rosters, event),
    plays: (summary.plays || [])
      .filter((play) => play.text || play.shortText)
      .slice(-12)
      .reverse()
      .map((play) => ({
        id: play.id || slugify(play.text || play.shortText || "play"),
        text: play.text || play.shortText || "",
        clock: play.clock?.displayValue,
        period: play.period?.number,
      })),
    timeline: buildTimeline(summary, competition),
    predictor: buildPredictor(summary),
    labels: sportLabels(event),
    broadcasts: normalizeBroadcasts(
      summary.broadcasts?.length ? summary.broadcasts : competition?.broadcasts,
    ),
    updatedAt: new Date().toISOString(),
  };
}

function detailsFromScoreboard(event: SportsEvent, body: EspnScoreboardBody): EventDetails {
  const family = sportFamily(event);
  const raw = body.events?.find((item) => String(item.id) === String(event.sourceEventId)) || body.events?.[0];
  const base = emptyDetails(event);
  if (!raw) return base;

  if (family === "tennis") {
    const competitions = (raw.groupings || []).flatMap((group) => group.competitions || []);
    const competition =
      competitions.find((item) => String(item.id) === String(event.sourceCompetitionId)) ||
      competitions[0] ||
      raw.competitions?.[0];
    const competitors = (competition?.competitors || [])
      .map(participantFrom)
      .filter((item): item is DetailParticipant => Boolean(item));
    const segments = buildSegments(competitors, competition, "tennis");
    return {
      ...base,
      family: "tennis",
      status: {
        state: statusFrom(competition?.status?.type?.state || raw.status?.type?.state),
        label: competition?.status?.type?.shortDetail || raw.status?.type?.shortDetail,
        clock: competition?.status?.displayClock,
        period: competition?.status?.period,
      },
      roundLabel: competition?.round?.displayName || competition?.type?.text,
      participants: competitors.length ? competitors : base.participants,
      segments,
      broadcasts: normalizeBroadcasts(competition?.broadcasts)?.length
        ? normalizeBroadcasts(competition?.broadcasts)
        : event.broadcasts,
      updatedAt: new Date().toISOString(),
    };
  }

  if (family === "combat") {
    const contests = buildContests(raw.competitions || []);
    const featured =
      contests.find((item) => String(item.id) === String(event.sourceCompetitionId)) ||
      [...contests].reverse().find((item) => item.participants.length >= 2) ||
      contests[0];
    return {
      ...base,
      family: "combat",
      status: {
        state: statusFrom(raw.status?.type?.state),
        label: featured?.status || raw.status?.type?.shortDetail,
      },
      roundLabel: featured?.weightClass || raw.name,
      participants: featured?.participants?.length ? featured.participants : base.participants,
      contests: contests.length ? contests : undefined,
      broadcasts: event.broadcasts,
      updatedAt: new Date().toISOString(),
    };
  }

  const competition = raw.competitions?.[0];
  const standings = buildStandings(competition?.competitors || []);
  return {
    ...base,
    family,
    status: {
      state: statusFrom(competition?.status?.type?.state || raw.status?.type?.state),
      label: competition?.status?.type?.shortDetail || raw.status?.type?.shortDetail,
      clock: competition?.status?.displayClock,
      period: competition?.status?.period,
    },
    participants: standings.slice(0, 2).map((item) => item.participant).length
      ? standings.slice(0, 2).map((item) => item.participant)
      : base.participants,
    standings: standings.length ? standings : base.standings,
    broadcasts: normalizeBroadcasts(competition?.broadcasts)?.length
      ? normalizeBroadcasts(competition?.broadcasts)
      : event.broadcasts,
    updatedAt: new Date().toISOString(),
  };
}

async function fetchScoreboardForEvent(event: SportsEvent) {
  if (!event.sourceLeaguePath) return null;
  const center = new Date(event.startsAt);
  const days = [-1, 0, 1, -2, 2];
  for (const offset of days) {
    const date = new Date(center);
    date.setUTCDate(date.getUTCDate() + offset);
    const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
    const body = await fetchJsonFresh<EspnScoreboardBody>(
      `https://site.api.espn.com/apis/site/v2/sports/${event.sourceLeaguePath}/scoreboard?dates=${stamp}&limit=1000`,
    );
    if (!body?.events?.length) continue;
    if (body.events.some((item) => String(item.id) === String(event.sourceEventId)) || !event.sourceEventId) {
      return body;
    }
  }
  return fetchJsonFresh<EspnScoreboardBody>(
    `https://site.api.espn.com/apis/site/v2/sports/${event.sourceLeaguePath}/scoreboard?limit=1000`,
  );
}

function withStoredLogos(event: SportsEvent, details: EventDetails): EventDetails {
  const logoBySlug = new Map<string, string>();
  if (event.home.logo) logoBySlug.set(event.home.slug, event.home.logo);
  if (event.away.logo) logoBySlug.set(event.away.slug, event.away.logo);
  for (const participant of event.participants || []) {
    if (participant.logo) logoBySlug.set(participant.slug, participant.logo);
  }
  const fill = <T extends { slug?: string; name?: string; logo?: string }>(item: T): T => {
    if (item.logo) return item;
    const bySlug = item.slug ? logoBySlug.get(item.slug) : undefined;
    const byName = item.name ? logoBySlug.get(slugify(item.name)) : undefined;
    return { ...item, logo: bySlug || byName || item.logo };
  };
  return {
    ...details,
    participants: details.participants.map(fill),
    standings: details.standings?.map((entry) => ({
      ...entry,
      participant: fill(entry.participant),
    })),
    contests: details.contests?.map((contest) => ({
      ...contest,
      participants: contest.participants.map(fill),
    })),
  };
}

export async function fetchEspnEventDetails(event: SportsEvent): Promise<EventDetails> {
  const fallback = emptyDetails(event);
  if (event.source !== "espn" || !event.sourceLeaguePath) return fallback;

  const family = sportFamily(event);

  // Team sports usually expose a rich summary endpoint.
  if (family === "team" && event.sourceEventId) {
    const summary = await fetchJson<EspnSummary>(
      `https://site.api.espn.com/apis/site/v2/sports/${event.sourceLeaguePath}/summary?event=${event.sourceEventId}`,
      90,
    );
    if (summary) {
      const details = detailsFromSummary(event, summary);
      if (!details.broadcasts?.length && event.broadcasts?.length) details.broadcasts = event.broadcasts;
      return withStoredLogos(event, details);
    }
  }

  // Tennis/combat/racing/golf and summary failures fall back to scoreboard.
  const scoreboard = await fetchScoreboardForEvent(event);
  if (scoreboard) return withStoredLogos(event, detailsFromScoreboard(event, scoreboard));
  return fallback;
}
