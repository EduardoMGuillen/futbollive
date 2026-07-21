export const FAVORITES_KEY = "dj_favorites";
export const FAVORITE_LEAGUES_KEY = "dj_favorite_leagues";
export const FAVORITE_TEAMS_KEY = "dj_favorite_teams";
export const FAVORITES_CHANGED = "dj:favorites-changed";
export const REMINDERS_KEY = "dj_favorite_reminders";

export type FavoriteTeam = {
  slug: string;
  name: string;
  logo?: string;
  href: string;
  sportSlug?: string;
};

export type FavoriteLeague = {
  slug: string;
  name: string;
  sportSlug?: string;
};

function readJsonArray<T>(key: string, guard: (item: unknown) => item is T): T[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter(guard) : [];
  } catch {
    return [];
  }
}

export function readFavoriteIds() {
  return readJsonArray(FAVORITES_KEY, (id): id is string => typeof id === "string");
}

export function writeFavoriteIds(ids: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(ids)]));
  window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED));
}

export function readFavoriteLeagues() {
  return readJsonArray(FAVORITE_LEAGUES_KEY, (item): item is FavoriteLeague =>
    Boolean(item && typeof item === "object" && typeof (item as FavoriteLeague).slug === "string" && typeof (item as FavoriteLeague).name === "string"),
  );
}

export function writeFavoriteLeagues(leagues: FavoriteLeague[]) {
  const unique = new Map(leagues.map((item) => [item.slug, item]));
  localStorage.setItem(FAVORITE_LEAGUES_KEY, JSON.stringify([...unique.values()]));
  window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED));
}

export function toggleFavoriteLeague(league: FavoriteLeague) {
  const current = readFavoriteLeagues();
  const exists = current.some((item) => item.slug === league.slug);
  writeFavoriteLeagues(exists ? current.filter((item) => item.slug !== league.slug) : [...current, league]);
  return !exists;
}

export function readFavoriteTeams() {
  return readJsonArray(FAVORITE_TEAMS_KEY, (item): item is FavoriteTeam =>
    Boolean(item && typeof item === "object" && typeof (item as FavoriteTeam).slug === "string" && typeof (item as FavoriteTeam).name === "string"),
  );
}

export function writeFavoriteTeams(teams: FavoriteTeam[]) {
  const unique = new Map(teams.map((item) => [item.slug, item]));
  localStorage.setItem(FAVORITE_TEAMS_KEY, JSON.stringify([...unique.values()]));
  window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED));
}

export function toggleFavoriteTeam(team: FavoriteTeam) {
  const current = readFavoriteTeams();
  const exists = current.some((item) => item.slug === team.slug);
  writeFavoriteTeams(exists ? current.filter((item) => item.slug !== team.slug) : [...current, team]);
  return !exists;
}

export function isFavoriteLeague(slug: string) {
  return readFavoriteLeagues().some((item) => item.slug === slug);
}

export function isFavoriteTeam(slug: string) {
  return readFavoriteTeams().some((item) => item.slug === slug);
}
