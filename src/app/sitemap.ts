import type { MetadataRoute } from "next";
import { getEspnSportsCatalog } from "@/lib/espn";
import { ESPORTS_GAMES, isEsport, participantHref } from "@/lib/sports";
import { readStore } from "@/lib/store";
import { siteUrl } from "@/lib/utils";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const data = await readStore();
  const events = data.events.filter((event) => !event.hidden);
  const staticRoutes = ["", "/en-vivo", "/deportes", "/esports", "/resultados", "/acerca-de", "/contacto", "/privacidad", "/terminos"];
  const catalogSports = getEspnSportsCatalog().map((sport) => `/deporte/${sport.slug}`);
  const esportsRoutes = ESPORTS_GAMES.map((game) => `/esports/${game.slug}`);
  const collectionRoutes = [...new Set([
    ...catalogSports,
    ...esportsRoutes,
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
    priority: route === "" ? 1 : route === "/en-vivo" || route === "/deportes" ? 0.9 : 0.5,
  }));
  const collectionEntries: MetadataRoute.Sitemap = collectionRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.75,
  }));
  const eventEntries: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${base}/partido/${event.slug}`,
    lastModified: new Date(event.updatedAt),
    changeFrequency: event.status === "live" ? "always" : "hourly",
    priority: event.status === "live" || event.featured ? 0.9 : 0.8,
  }));
  return [...staticEntries, ...collectionEntries, ...eventEntries];
}
