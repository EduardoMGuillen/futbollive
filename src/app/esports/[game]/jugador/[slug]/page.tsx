import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { EventCard } from "@/components/EventCard";
import { TeamLogo } from "@/components/TeamLogo";
import { fetchPandaScorePlayer, pandascoreGameBySlug } from "@/lib/pandascore";
import { ESPORTS_GAMES } from "@/lib/sports";
import { readStore } from "@/lib/store";
import { isPubliclyVisible, siteUrl, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}): Promise<Metadata> {
  const { game: gameSlug, slug } = await params;
  const game = ESPORTS_GAMES.find((item) => item.slug === gameSlug);
  const psGame = pandascoreGameBySlug(gameSlug);
  if (!game || !psGame) return { title: "Jugador" };
  const player = await fetchPandaScorePlayer(psGame.path, slug);
  const name = player?.name || slug.replace(/-/g, " ");
  const title = `${name}: jugador de ${game.name}, equipo y próximos partidos`;
  const description = `Perfil de ${name} en ${game.name}: equipo actual, rol, nacionalidad y próximas series con horarios locales.`;
  return {
    title,
    description,
    keywords: [`${name} ${game.name}`, `${name} jugador`, `${name} equipo`],
    alternates: { canonical: `/esports/${gameSlug}/jugador/${slug}` },
    openGraph: { title, description, url: `/esports/${gameSlug}/jugador/${slug}` },
  };
}

export default async function EsportPlayerPage({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}) {
  const { game: gameSlug, slug } = await params;
  const game = ESPORTS_GAMES.find((item) => item.slug === gameSlug);
  const psGame = pandascoreGameBySlug(gameSlug);
  if (!game || !psGame) notFound();
  const player = await fetchPandaScorePlayer(psGame.path, slug);
  if (!player) notFound();

  const teamName = player.current_team?.name;
  const teamSlug = teamName ? slugify(teamName) : undefined;
  const data = await readStore();
  const events = teamSlug
    ? data.events
        .filter(
          (event) =>
            event.sportSlug === gameSlug &&
            !event.hidden &&
            isPubliclyVisible(event) &&
            (event.home.slug === teamSlug || event.away.slug === teamSlug),
        )
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    : [];
  const fullName = [player.first_name, player.last_name].filter(Boolean).join(" ");
  const baseUrl = siteUrl();
  const graph = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.name,
    alternateName: fullName || undefined,
    nationality: player.nationality || undefined,
    image: player.image_url || undefined,
    url: `${baseUrl}/esports/${gameSlug}/jugador/${slug}`,
    memberOf: teamName ? { "@type": "SportsTeam", name: teamName, sport: game.name } : undefined,
  };

  return (
    <>
      <section className={`page-hero esports-hero game-hero game-${gameSlug}`}><div className="container">
        <BackLink
          href={teamSlug ? `/esports/${gameSlug}/equipo/${teamSlug}` : `/esports/${gameSlug}`}
          label={teamSlug && teamName ? `Volver a ${teamName}` : `Volver a ${game.name}`}
        />
        <div className="breadcrumbs">
          <Link href="/">Inicio</Link> / <Link href="/esports">Esports</Link> / <Link href={`/esports/${gameSlug}`}>{game.name}</Link> / {player.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <TeamLogo name={player.name || "Jugador"} src={player.image_url || undefined} size={76} />
          <div>
            <h1>{player.name}</h1>
            <p>{[fullName || null, player.role, player.nationality].filter(Boolean).join(" · ") || `Jugador de ${game.name}`}</p>
          </div>
        </div>
      </div></section>
      <div className="container content-section">
        <div className="quick-facts" style={{ marginBottom: 28 }}>
          <div><small>Juego</small><strong>{game.name}</strong></div>
          <div>
            <small>Equipo actual</small>
            <strong>
              {teamName && teamSlug
                ? <Link href={`/esports/${gameSlug}/equipo/${teamSlug}`}>{teamName}</Link>
                : "Agente libre"}
            </strong>
          </div>
          <div><small>Rol</small><strong>{player.role || "Por confirmar"}</strong></div>
          <div><small>Nacionalidad</small><strong>{player.nationality || "Por confirmar"}</strong></div>
        </div>
        <section className="content-section" style={{ paddingTop: 0 }}>
          <div className="section-head"><div><h2>Próximas series {teamName ? `de ${teamName}` : ""}</h2></div></div>
          {events.length
            ? <div className="events-grid">{events.map((event) => <EventCard event={event} key={event.id} />)}</div>
            : <div className="empty-state">No hay series en la agenda por ahora.</div>}
        </section>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
    </>
  );
}
