export type EventStatus = "live" | "upcoming" | "finished";

export type EventPhase =
  | "groups"
  | "league"
  | "round-of-32"
  | "round-of-16"
  | "quarterfinal"
  | "semifinal"
  | "third-place"
  | "final"
  | "other";

export interface Participant {
  name: string;
  slug: string;
  logo?: string;
  score?: number | string;
}

export interface RankedParticipant extends Participant {
  position?: number;
  isWinner?: boolean;
}

export interface LineupPlayer {
  name: string;
  position?: string;
  number?: string;
  nationality?: string;
  photo?: string;
  slug?: string;
}

export interface BroadcastOption {
  name: string;
  type?: "tv" | "streaming" | "radio";
  region?: string;
  url?: string;
}

export interface StatisticValue {
  key: string;
  label: string;
  displayValue: string;
  value?: number | string;
  participantId?: string;
  unit?: string;
  rank?: number;
}

export interface DetailParticipant {
  id: string;
  name: string;
  shortName?: string;
  slug: string;
  side?: "home" | "away";
  logo?: string;
  score?: number | string;
  winner?: boolean;
  kind?: "team" | "athlete";
  statistics?: StatisticValue[];
}

export interface EventSegment {
  key: string;
  label: string;
  status?: string;
  scores: Array<{
    participantId: string;
    value: number | string;
    tiebreak?: number | string;
  }>;
}

export interface StatisticGroup {
  key: string;
  label: string;
  participantId?: string;
  participantName?: string;
  statistics: StatisticValue[];
}

export interface EventContest {
  id: string;
  label?: string;
  order?: number;
  weightClass?: string;
  status?: string;
  participants: DetailParticipant[];
  result?: {
    winnerId?: string;
    method?: string;
    round?: number | string;
    time?: string;
    displayValue?: string;
  };
}

export interface StandingEntry {
  position?: number;
  participant: DetailParticipant;
  status?: string;
  score?: number | string;
  metrics?: StatisticValue[];
}

export interface EventPredictor {
  homePct?: number;
  awayPct?: number;
  tiePct?: number;
  label?: string;
}

/** Incidencia estructurada (gol, tarjeta, anotación) con minuto y protagonista. */
export interface TimelineEntry {
  id: string;
  label: string;
  minute?: string;
  period?: number;
  text?: string;
  player?: string;
  assist?: string;
  participantId?: string;
  teamName?: string;
  scoring?: boolean;
}

export interface EventDetails {
  eventId: string;
  family: "team" | "tennis" | "combat" | "racing" | "golf" | "generic";
  status: {
    state: EventStatus;
    label?: string;
    clock?: string;
    period?: number;
    periodLabel?: string;
  };
  roundLabel?: string;
  participants: DetailParticipant[];
  segments?: EventSegment[];
  statisticGroups?: StatisticGroup[];
  leaders?: StatisticGroup[];
  contests?: EventContest[];
  standings?: StandingEntry[];
  lineups?: Array<{
    participantId: string;
    participantName: string;
    players: LineupPlayer[];
  }>;
  plays?: Array<{
    id: string;
    text: string;
    clock?: string;
    period?: number;
  }>;
  timeline?: TimelineEntry[];
  predictor?: EventPredictor;
  labels: {
    participantHref: "equipo" | "atleta";
    rosterTitle: string;
    segmentTitle?: string;
    statsTitle?: string;
    leadersTitle?: string;
    standingsTitle?: string;
    contestsTitle?: string;
    whenLabel: string;
    whereLabel: string;
  };
  broadcasts?: BroadcastOption[];
  updatedAt: string;
}

export interface SportsEvent {
  id: string;
  slug: string;
  sport: string;
  sportSlug: string;
  league: string;
  leagueSlug: string;
  /** Fase legible (Final, Octavos de final, Jornada 12, …). */
  roundLabel?: string;
  phase?: EventPhase;
  format?: "versus" | "multi";
  eventName?: string;
  participants?: RankedParticipant[];
  home: Participant;
  away: Participant;
  startsAt: string;
  status: EventStatus;
  minute?: string;
  venue?: string;
  country?: string;
  importance: number;
  featured?: boolean;
  hidden?: boolean;
  excludedFromLive?: boolean;
  description?: string;
  homeLineup?: LineupPlayer[];
  awayLineup?: LineupPlayer[];
  broadcasts?: BroadcastOption[];
  /** Formato de serie en esports (BO1, BO3, BO5). */
  bestOf?: number;
  source: "demo" | "thesportsdb" | "espn" | "manual" | "pandascore";
  sourceEventId?: string;
  sourceCompetitionId?: string;
  sourceLeaguePath?: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  label: string;
  image?: string;
  url?: string;
  position: "top" | "feed" | "sidebar" | "detail" | "footer";
  active: boolean;
}

export interface SiteSettings {
  liveThreshold: number;
  maxFeaturedLive: number;
  ctaEnabled: boolean;
  lastSync?: string;
}

export interface StoreData {
  events: SportsEvent[];
  banners: Banner[];
  settings: SiteSettings;
}
