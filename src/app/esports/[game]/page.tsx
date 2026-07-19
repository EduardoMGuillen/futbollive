import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { BackLink } from "@/components/BackLink";
import { Countdown } from "@/components/Countdown";
import { EventCard } from "@/components/EventCard";
import { LocalTime } from "@/components/LocalTime";
import { TeamLogo } from "@/components/TeamLogo";
import { ESPORTS_GAMES } from "@/lib/sports";
import { readStore } from "@/lib/store";
import { ensureFreshEvents } from "@/lib/sync";
import { isPubliclyVisible, siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

function gameBySlug(slug: string) {
  return ESPORTS_GAMES.find((game) => game.slug === slug);
}

export function generateStaticParams() {
  return ESPORTS_GAMES.map((game) => ({ game: game.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ game: string }> }): Promise<Metadata> {
  const { game: slug } = await params;
  const game = gameBySlug(slug);
  if (!game) return { title: "Esports" };
  const title = `Ver ${game.name} en vivo gratis: partidos de hoy y horarios`;
  const description = `Agenda de ${game.name}: series en vivo, próximos partidos con hora local, marcadores, rosters y dónde ver cada serie gratis.`;
  return {
    title,
    description,
    keywords: [
      `ver ${game.name} gratis`,
      `${game.name} en vivo`,
      `partidos ${game.name} hoy`,
      `${game.name} horarios`,
      `dónde ver ${game.name}`,
      `${game.name} esports`,
    ],
    alternates: { canonical: `/esports/${game.slug}` },
    openGraph: { title, description, url: `/esports/${game.slug}` },
  };
}

export default async function EsportGamePage({ params }: { params: Promise<{ game: string }> }) {
  const { game: slug } = await params;
  const game = gameBySlug(slug);
  if (!game) notFound();
  await ensureFreshEvents();
  const data = await readStore();
  const allEvents = data.events.filter((event) => event.sportSlug === game.slug && !event.hidden);
  const events = allEvents.filter((event) => isPubliclyVisible(event));
  const live = events.filter((event) => event.status === "live");
  const upcoming = events
    .filter((event) => event.status === "upcoming")
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const finished = events
    .filter((event) => event.status === "finished")
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
  const heroEvent = live[0] || upcoming[0];
  const tournaments = Array.from(new Map(events.map((event) => [event.leagueSlug, event.league])).entries());
  const teams = Array.from(new Map(
    events.flatMap((event) => [event.home, event.away]).map((team) => [team.slug, team]),
  ).values()).slice(0, 12);
  const baseUrl = siteUrl();

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${game.name} en vivo`,
        url: `${baseUrl}/esports/${game.slug}`,
        description: `Series de ${game.name} en vivo y próximas, con horarios locales y dónde verlas.`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
          { "@type": "ListItem", position: 2, name: "Esports", item: `${baseUrl}/esports` },
          { "@type": "ListItem", position: 3, name: game.name, item: `${baseUrl}/esports/${game.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <section className={`page-hero esports-hero game-hero game-${game.slug}`}><div className="container">
        <BackLink href="/esports" label="Volver a Esports" />
        <div className="breadcrumbs"><Link href="/">Inicio</Link> / <Link href="/esports">Esports</Link> / {game.name}</div>
        <h1>{game.name} en vivo</h1>
        <p>{game.tagline}</p>
        {heroEvent && (
          <Link href={`/partido/${heroEvent.slug}`} className="game-hero-card">
            <div className="game-hero-teams">
              <span className="game-hero-team">
                <TeamLogo name={heroEvent.home.name} src={heroEvent.home.logo} size={52} />
                <strong>{heroEvent.home.name}</strong>
              </span>
              <span className="game-hero-center">
                {heroEvent.status === "live" ? (
                  <>
                    <span className="live-badge"><i /> {heroEvent.minute || "EN VIVO"}</span>
                    <b className="score">{heroEvent.home.score ?? 0} – {heroEvent.away.score ?? 0}</b>
                  </>
                ) : (
                  <>
                    <LocalTime iso={heroEvent.startsAt} mode="datetime-short" />
                    <Countdown startsAt={heroEvent.startsAt} />
                  </>
                )}
              </span>
              <span className="game-hero-team">
                <TeamLogo name={heroEvent.away.name} src={heroEvent.away.logo} size={52} />
                <strong>{heroEvent.away.name}</strong>
              </span>
            </div>
            <small>{heroEvent.league}{heroEvent.bestOf ? ` · BO${heroEvent.bestOf}` : ""}</small>
          </Link>
        )}
      </div></section>
      <div className="container content-section category-layout">
        <div>
          {live.length > 0 && (
            <section className="content-section" style={{ paddingTop: 0 }}>
              <div className="section-head"><div><span className="eyebrow"><i /> EN VIVO</span><h2>Series en vivo</h2></div></div>
              <div className="events-grid">{live.map((event) => <EventCard event={event} key={event.id} />)}</div>
            </section>
          )}
          <section className="content-section" style={{ paddingTop: live.length ? undefined : 0 }}>
            <div className="section-head"><div><h2>Próximas series</h2><p>{upcoming.length} en agenda · hora local</p></div></div>
            {upcoming.length
              ? <div className="events-grid">{upcoming.map((event) => <EventCard event={event} key={event.id} />)}</div>
              : <div className="empty-state">No hay series próximas de {game.name} en la agenda.</div>}
          </section>
          {finished.length > 0 && (
            <section className="content-section">
              <div className="section-head"><div><h2>Resultados recientes</h2><p><Link href={`/resultados?deporte=${game.slug}`}>Ver archivo completo →</Link></p></div></div>
              <div className="events-grid">{finished.slice(0, 6).map((event) => <EventCard event={event} key={event.id} />)}</div>
            </section>
          )}
        </div>
        <aside className="sidebar">
          <div className="league-list">
            <h3>Torneos</h3>
            {tournaments.length
              ? tournaments.map(([leagueSlug, name]) => <Link href={`/liga/${leagueSlug}`} key={leagueSlug}>{name}<span>›</span></Link>)
              : <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>Sin torneos activos.</p>}
          </div>
          {teams.length > 0 && (
            <div className="league-list">
              <h3>Equipos</h3>
              {teams.map((team) => (
                <Link href={`/esports/${game.slug}/equipo/${team.slug}`} key={team.slug}>
                  <span className="inline-participant"><TeamLogo name={team.name} src={team.logo} size={22} /> {team.name}</span>
                  <span>›</span>
                </Link>
              ))}
            </div>
          )}
          <AdSlot variant="box" banner={data.banners.find((banner) => banner.position === "sidebar")} />
        </aside>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
    </>
  );
}
