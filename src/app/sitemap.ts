import type { MetadataRoute } from "next";
import { readStore } from "@/lib/store";
import { siteUrl } from "@/lib/utils";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const data = await readStore();
  const events = data.events.filter((event) => !event.hidden);
  const staticRoutes = ["", "/en-vivo", "/contacto", "/privacidad", "/terminos"];
  const collectionRoutes = [...new Set(events.flatMap((event) => [
    `/deporte/${event.sportSlug}`,
    `/liga/${event.leagueSlug}`,
    `/equipo/${event.home.slug}`,
    `/equipo/${event.away.slug}`,
  ]))];
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : route === "/en-vivo" ? 0.9 : 0.5,
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
