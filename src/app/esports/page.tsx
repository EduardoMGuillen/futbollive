import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { EventCard } from "@/components/EventCard";
import { ESPORTS_GAMES, sportIcon } from "@/lib/sports";
import { isPandaScoreConfigured } from "@/lib/pandascore";
import { readStore } from "@/lib/store";
import { ensureFreshEvents } from "@/lib/sync";
import { isPubliclyVisible } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Esports en vivo: Valorant, League of Legends y CS2 gratis",
  description:
    "Partidos de esports hoy: Valorant (VCT), League of Legends (LEC, LCK, Worlds) y Counter-Strike 2 (Majors, ESL). Horarios locales, marcadores en vivo, rosters y dónde ver cada serie gratis.",
  keywords: [
    "esports en vivo",
    "ver valorant gratis",
    "ver lol esports gratis",
    "ver cs2 gratis",
    "partidos esports hoy",
    "vct en vivo",
    "worlds lol",
    "major cs2",
  ],
  alternates: { canonical: "/esports" },
  openGraph: {
    title: "Esports en vivo: Valorant, LoL y CS2",
    description: "Agenda completa de esports con marcadores en vivo, rosters y dónde ver cada serie.",
    url: "/esports",
  },
};
export const dynamic = "force-dynamic";

export default async function EsportsHubPage() {
  await ensureFreshEvents();
  const data = await readStore();
  const configured = isPandaScoreConfigured();
  const bySlug = new Map<string, (typeof ESPORTS_GAMES)[number]>(ESPORTS_GAMES.map((game) => [game.slug, game]));
  const events = data.events.filter(
    (event) => bySlug.has(event.sportSlug) && !event.hidden && isPubliclyVisible(event),
  );
  const live = events.filter((event) => event.status === "live");
  const upcoming = events
    .filter((event) => event.status === "upcoming")
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  return (
    <>
      <section className="page-hero esports-hero"><div className="container">
        <div className="breadcrumbs"><Link href="/">Inicio</Link> / Esports</div>
        <h1>Esports en vivo</h1>
        <p>Valorant, League of Legends y Counter-Strike 2: series en vivo, horarios en tu hora local, rosters y dónde ver cada partido.</p>
      </div></section>
      <main className="container content-section">
        <div className="sports-directory esports-directory">
          {ESPORTS_GAMES.map((game) => {
            const count = events.filter((event) => event.sportSlug === game.slug).length;
            return (
              <Link key={game.slug} href={`/esports/${game.slug}`} className={`sport-tile game-tile game-${game.slug}`}>
                <span className="sport-tile-icon" aria-hidden>{sportIcon(game.slug)}</span>
                <strong>{game.name}</strong>
                <small>{count > 0 ? `${count} serie${count === 1 ? "" : "s"} en agenda` : "Sin series ahora"}</small>
              </Link>
            );
          })}
        </div>
        {!configured && !events.length && (
          <div className="empty-state">
            La fuente de datos de esports aún no está configurada. Agrega la variable <code>PANDASCORE_TOKEN</code> para activar Valorant, LoL y CS2.
          </div>
        )}
        {live.length > 0 && (
          <section className="content-section">
            <div className="section-head"><div><span className="eyebrow"><i /> EN VIVO</span><h2>Series en vivo</h2></div></div>
            <div className="events-grid">{live.map((event) => <EventCard event={event} key={event.id} />)}</div>
          </section>
        )}
        <section className="content-section">
          <div className="section-head"><div><h2>Próximas series</h2><p>Ordenadas por hora local</p></div></div>
          {upcoming.length
            ? <div className="events-grid">{upcoming.slice(0, 18).map((event) => <EventCard event={event} key={event.id} />)}</div>
            : <div className="empty-state">No hay series próximas en la agenda.</div>}
        </section>
        <AdSlot banner={data.banners.find((banner) => banner.position === "feed")} />
      </main>
    </>
  );
}
