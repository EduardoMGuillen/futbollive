import { getEspnLeagueCatalog } from "./espn";
import { slugify } from "./utils";

export type LeagueCatalogEntry = {
  path: string;
  league: string;
  sport: string;
  sportSlug: string;
  leagueSlug: string;
};

let cache: LeagueCatalogEntry[] | null = null;

export function getLeagueCatalog(): LeagueCatalogEntry[] {
  if (cache) return cache;
  cache = getEspnLeagueCatalog().map((item) => ({
    ...item,
    leagueSlug: slugify(item.league),
  }));
  return cache;
}

export function resolveLeagueBySlug(slug: string): LeagueCatalogEntry | undefined {
  return getLeagueCatalog().find((item) => item.leagueSlug === slug);
}

export function allLeagueSlugs(extraSlugs: string[] = []) {
  const fromCatalog = getLeagueCatalog().map((item) => item.leagueSlug);
  return Array.from(new Set([...fromCatalog, ...extraSlugs]));
}
