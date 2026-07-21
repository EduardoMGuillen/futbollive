import type { MetadataRoute } from "next";
import { getEspnSportsCatalog } from "@/lib/espn";
import { getAllPosts } from "@/lib/blog-posts";
import { allLeagueSlugs } from "@/lib/leagues";
import { ESPORTS_GAMES, isEsport, participantHref } from "@/lib/sports";
import { SPORT_TODAY_PAGES } from "@/lib/sport-today";
import { readStore } from "@/lib/store";
import { matchupSlug } from "@/lib/vs";
import { siteUrl } from "@/lib/utils";

export const revalidate = 300;

function priorityForRoute(route: string) {
  if (route === "") return 1;
  if (route === "/en-vivo" || route === "/deportes" || route === "/esports") return 0.95;
  if (route.startsWith("/deporte/") || route.startsWith("/liga/copa-del-mundo")) return 0.9;
  if (route.endsWith("-hoy") || route.startsWith("/liga/") || route.startsWith("/esports/")) return 0.85;
  if (route.startsWith("/equipo/") || route.startsWith("/atleta/") || route.startsWith("/vs/")) return 0.8;
  if (route.startsWith("/blog")) return 0.7;
  return 0.65;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const data = await readStore();
  const events = data.events.filter((event) => !event.hidden);
  const staticRoutes = ["", "/en-vivo", "/deportes", "/esports", "/resultados", "/blog", "/acerca-de", "/contacto", "/privacidad", "/terminos"];
  const catalogSports = getEspnSportsCatalog().map((sport) => `/deporte/${sport.slug}`);
  const leagueRoutes = allLeagueSlugs().map((slug) => `/liga/${slug}`);
  const sportTodayRoutes = SPORT_TODAY_PAGES.map((p) => `/${p.slug}`);
  const blogRoutes = getAllPosts().map((p) => `/blog/${p.slug}`);
  const esportsRoutes = ESPORTS_GAMES.map((game) => `/esports/${game.slug}`);
  const vsRoutes = [
    ...new Set(
      events
        .filter((event) => !isEsport(event) && event.format !== "multi")
        .map((event) => `/vs/${matchupSlug(event.home.name, event.away.name)}`),
    ),
  ].slice(0, 400);
  const collectionRoutes = [...new Set([
    ...catalogSports,
    ...leagueRoutes,
    ...sportTodayRoutes,
    ...blogRoutes,
    ...esportsRoutes,
    ...vsRoutes,
    ...events.flatMap((event) => {
      const people = event.participants?.length ? event.participants : [event.home, event.away];
      return [
        isEsport(event) ? `/esports/${event.sportSlug}` : `/deporte/${event.sportSlug}`,
        `/liga/${event.leagueSlug}`,
        ...people.map((person) => participantHref(event, person.slug)),
      ];
    }),
  ])];
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: priorityForRoute(route),
  }));
  const collectionEntries: MetadataRoute.Sitemap = collectionRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route.includes("-hoy") || route.startsWith("/liga/") ? "hourly" : "daily",
    priority: priorityForRoute(route),
  }));
  const eventEntries: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${base}/partido/${event.slug}`,
    lastModified: new Date(event.updatedAt),
    changeFrequency: event.status === "live" ? "always" : "hourly",
    priority: event.status === "live" || event.featured ? 0.95 : event.importance && event.importance >= 90 ? 0.9 : 0.75,
  }));
  return [...staticEntries, ...collectionEntries, ...eventEntries];
}
