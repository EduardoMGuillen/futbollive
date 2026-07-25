import { EDITORIAL_LEAGUES, EDITORIAL_SPORTS } from "./editorial-events";
import { getEspnLeagueCatalog, getEspnSportsCatalog } from "./espn";
import { slugify } from "./utils";

export type LeagueCatalogEntry = {
  path: string;
  league: string;
  sport: string;
  sportSlug: string;
  leagueSlug: string;
};

export type SportCatalogEntry = { slug: string; name: string };

let cache: LeagueCatalogEntry[] | null = null;
let sportsCache: SportCatalogEntry[] | null = null;

export function getLeagueCatalog(): LeagueCatalogEntry[] {
  if (cache) return cache;
  const espn = getEspnLeagueCatalog().map((item) => ({
    ...item,
    leagueSlug: slugify(item.league),
  }));
  const editorial: LeagueCatalogEntry[] = EDITORIAL_LEAGUES.map((item) => ({ ...item }));
  const map = new Map<string, LeagueCatalogEntry>();
  for (const item of [...espn, ...editorial]) map.set(item.leagueSlug, item);
  cache = Array.from(map.values());
  return cache;
}

/** Catálogo de deportes: ESPN + editoriales (p. ej. Boxeo / Velada). */
export function getSportsCatalog(): SportCatalogEntry[] {
  if (sportsCache) return sportsCache;
  const map = new Map<string, SportCatalogEntry>(
    getEspnSportsCatalog().map((sport) => [sport.slug, sport]),
  );
  for (const sport of EDITORIAL_SPORTS) {
    if (!map.has(sport.slug)) map.set(sport.slug, { slug: sport.slug, name: sport.name });
  }
  sportsCache = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "es"));
  return sportsCache;
}

export function resolveLeagueBySlug(slug: string): LeagueCatalogEntry | undefined {
  return getLeagueCatalog().find((item) => item.leagueSlug === slug);
}

export function allLeagueSlugs(extraSlugs: string[] = []) {
  const fromCatalog = getLeagueCatalog().map((item) => item.leagueSlug);
  return Array.from(new Set([...fromCatalog, ...extraSlugs]));
}
