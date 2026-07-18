export type EventStatus = "live" | "upcoming" | "finished";

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
}

export interface BroadcastOption {
  name: string;
  type?: "tv" | "streaming" | "radio";
  region?: string;
  url?: string;
}

export interface SportsEvent {
  id: string;
  slug: string;
  sport: string;
  sportSlug: string;
  league: string;
  leagueSlug: string;
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
  source: "demo" | "thesportsdb" | "espn" | "manual";
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
