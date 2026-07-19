import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { EventCard } from "@/components/EventCard";
import { TeamLogo } from "@/components/TeamLogo";
import { fetchPandaScoreTeam, pandascoreGameBySlug } from "@/lib/pandascore";
import { ESPORTS_GAMES } from "@/lib/sports";
import { readStore } from "@/lib/store";
import { isPubliclyVisible, siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}): Promise<Metadata> {
  const { game: gameSlug, slug } = await params;
  const game = ESPORTS_GAMES.find((item) => item.slug === gameSlug);
  if (!game) return { title: "Equipo" };
  const data = await readStore();
  const event = data.events.find(
    (item) => item.sportSlug === gameSlug && (item.home.slug === slug || item.away.slug === slug),
  );
  const name = event
    ? (event.home.slug === slug ? event.home.name : event.away.name)
    : slug.replace(/-/g, " ");
  const title = `${name} ${game.name}: próximos partidos, roster y horarios`;
  const description = `Consulta cuándo juega ${name} en ${game.name}, su roster actual, horarios locales y dónde ver cada serie gratis.`;
  return {
    title,
    description,
    keywords: [`${name} ${game.name}`, `${name} partidos`, `${name} roster`, `ver ${name} gratis`],
    alternates: { canonical: `/esports/${gameSlug}/equipo/${slug}` },
    openGraph: { title, description, url: `/esports/${gameSlug}/equipo/${slug}` },
  };
}

export default async function EsportTeamPage({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}) {
  const { game: gameSlug, slug } = await params;
  const game = ESPORTS_GAMES.find((item) => item.slug === gameSlug);
  const psGame = pandascoreGameBySlug(gameSlug);
  if (!game || !psGame) notFound();
  const data = await readStore();
  const allEvents = data.events.filter(
    (event) => event.sportSlug === gameSlug && !event.hidden && (event.home.slug === slug || event.away.slug === slug),
  );
  const team = await fetchPandaScoreTeam(psGame.path, slug);
  if (!allEvents.length && !team) notFound();

  const fromEvent = allEvents[0]
    ? (allEvents[0].home.slug === slug ? allEvents[0].home : allEvents[0].away)
    : undefined;
  const name = team?.name || fromEvent?.name || slug.replace(/-/g, " ");
  const logo = team?.image_url || fromEvent?.logo;
  const events = allEvents
    .filter((event) => isPubliclyVisible(event))
    .sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      const timeA = new Date(a.startsAt).getTime();
      const timeB = new Date(b.startsAt).getTime();
      return a.status === "finished" ? timeB - timeA : timeA - timeB;
    });
  const baseUrl = siteUrl();
  const graph = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name,
    sport: game.name,
    url: `${baseUrl}/esports/${gameSlug}/equipo/${slug}`,
    logo,
    athlete: (team?.players || []).map((player) => ({
      "@type": "Person",
      name: player.name,
      nationality: player.nationality,
    })),
  };

  return (
    <>
      <section className={`page-hero esports-hero game-hero game-${gameSlug}`}><div className="container">
        <BackLink href={`/esports/${gameSlug}`} label={`Volver a ${game.name}`} />
        <div className="breadcrumbs">
          <Link href="/">Inicio</Link> / <Link href="/esports">Esports</Link> / <Link href={`/esports/${gameSlug}`}>{game.name}</Link> / {name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <TeamLogo name={name} src={logo} size={76} />
          <div>
            <h1>{name}</h1>
            <p>
              {[team?.acronym, team?.location, game.name].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
      </div></section>
      <div className="container content-section">
        {team?.players?.length ? (
          <section className="content-section" style={{ paddingTop: 0 }}>
            <div className="section-head"><div><h2>Roster actual</h2><p>Fuente: PandaScore</p></div></div>
            <div className="roster-grid">
              {team.players.map((player) => (
                <Link
                  className="roster-card"
                  key={player.slug || player.name}
                  href={player.slug ? `/esports/${gameSlug}/jugador/${player.slug}` : `/esports/${gameSlug}/equipo/${slug}`}
                >
                  <TeamLogo name={player.name || "Jugador"} src={player.image_url || undefined} size={56} />
                  <strong>{player.name}</strong>
                  <small>{[player.role, player.nationality].filter(Boolean).join(" · ") || "Jugador"}</small>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
        <section className="content-section" style={{ paddingTop: team?.players?.length ? undefined : 0 }}>
          <div className="section-head"><div><h2>Agenda de {name}</h2><p>{events.length} series</p></div></div>
          {events.length
            ? <div className="events-grid">{events.map((event) => <EventCard event={event} key={event.id} />)}</div>
            : <div className="empty-state">No hay series próximas de {name} en la agenda.</div>}
        </section>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
    </>
  );
}
