import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { EventCard } from "@/components/EventCard";
import { FavoriteTeamButton } from "@/components/FavoriteEntityButtons";
import { TeamLogo } from "@/components/TeamLogo";
import { fetchEspnLeagueCalendar } from "@/lib/espn";
import { resolveLeagueBySlug } from "@/lib/leagues";
import { isEsport, isIndividualSport } from "@/lib/sports";
import { readStore } from "@/lib/store";
import { ensureFreshEvents } from "@/lib/sync";
import { eventTitle, isPubliclyVisible, siteUrl } from "@/lib/utils";
import type { SportsEvent } from "@/lib/types";

function matchesParticipant(event: SportsEvent, slug: string) {
  if (event.home.slug === slug || event.away.slug === slug) return true;
  return Boolean(event.participants?.some((participant) => participant.slug === slug));
}

function participantFromEvent(event: SportsEvent, slug: string) {
  if (event.home.slug === slug) return event.home;
  if (event.away.slug === slug) return event.away;
  return event.participants?.find((participant) => participant.slug === slug) || event.home;
}

/** Une store + calendario ESPN amplio de cada liga del equipo. */
async function loadParticipantEvents(slug: string, kind: "equipo" | "atleta") {
  const data = await readStore();
  const fromStore = data.events.filter((event) =>
    matchesParticipant(event, slug) &&
    !event.hidden &&
    !isEsport(event) &&
    (kind === "atleta" ? isIndividualSport(event) : !isIndividualSport(event)),
  );

  const paths = new Set<string>();
  for (const event of fromStore) {
    if (event.sourceLeaguePath) paths.add(event.sourceLeaguePath);
    const catalog = resolveLeagueBySlug(event.leagueSlug);
    if (catalog?.path) paths.add(catalog.path);
  }

  const calendars = paths.size
    ? await Promise.all(
      Array.from(paths).map((path) =>
        // Ventana corta + trozos en espn.ts: evita scoreboards de 3–7MB en el build.
        fetchEspnLeagueCalendar(path, { pastDays: 14, futureDays: 45 }),
      ),
    )
    : [];

  const merged = new Map<string, SportsEvent>();
  for (const event of fromStore) merged.set(event.id, event);
  for (const event of calendars.flat()) {
    if (!matchesParticipant(event, slug)) continue;
    if (kind === "atleta" ? !isIndividualSport(event) : isIndividualSport(event)) continue;
    const prev = merged.get(event.id);
    merged.set(event.id, prev ? {
      ...event,
      ...prev,
      roundLabel: event.roundLabel || prev.roundLabel,
      phase: event.phase && event.phase !== "other" ? event.phase : prev.phase,
      home: { ...event.home, score: event.home.score ?? prev.home.score, logo: event.home.logo || prev.home.logo },
      away: { ...event.away, score: event.away.score ?? prev.away.score, logo: event.away.logo || prev.away.logo },
      broadcasts: prev.broadcasts?.length ? prev.broadcasts : event.broadcasts,
      featured: prev.featured ?? event.featured,
    } : event);
  }

  return Array.from(merged.values());
}

export async function generateParticipantMetadata(slug: string, kind: "equipo" | "atleta"): Promise<Metadata> {
  const data = await readStore();
  const event = data.events.find((item) => matchesParticipant(item, slug) && !item.hidden && !isEsport(item) && (kind === "atleta" ? isIndividualSport(item) : !isIndividualSport(item)));
  if (!event) return { title: kind === "atleta" ? "Atleta" : "Equipo" };
  const participant = participantFromEvent(event, slug);
  const noun = kind === "atleta" ? "próximos eventos" : "próximos partidos";
  const title = `${participant.name}: ${noun}, horarios y dónde ver`;
  const description = kind === "atleta"
    ? `Consulta la agenda de ${participant.name}, horarios locales y dónde ver cada evento.`
    : `Consulta cuándo juega ${participant.name}, sus próximos partidos por liga, horarios locales y dónde ver cada encuentro.`;
  return {
    title,
    description,
    keywords: [
      participant.name,
      `${participant.name} partidos`,
      `${participant.name} horario`,
      `dónde ver ${participant.name}`,
      event.league,
      event.sport,
    ],
    alternates: { canonical: `/${kind}/${slug}` },
    openGraph: { title, description, url: `/${kind}/${slug}`, images: participant.logo ? [{ url: participant.logo }] : undefined },
  };
}

export async function ParticipantPage({
  slug,
  kind,
}: {
  slug: string;
  kind: "equipo" | "atleta";
}) {
  await ensureFreshEvents();
  const allEvents = await loadParticipantEvents(slug, kind);
  if (!allEvents.length) notFound();

  const live = allEvents.filter((e) => e.status === "live" && isPubliclyVisible(e));
  const upcoming = allEvents
    .filter((e) => e.status === "upcoming")
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const finished = allEvents
    .filter((e) => e.status === "finished")
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

  const participant = participantFromEvent(
    [...live, ...upcoming, ...finished][0] || allEvents[0],
    slug,
  );
  const sportSlug = allEvents[0].sportSlug;
  const sport = allEvents[0].sport;
  const leagues = Array.from(new Map(allEvents.map((e) => [e.leagueSlug, e.league])).entries());
  const byLeague = new Map<string, SportsEvent[]>();
  for (const event of [...live, ...upcoming]) {
    const list = byLeague.get(event.leagueSlug) || [];
    list.push(event);
    byLeague.set(event.leagueSlug, list);
  }

  const baseUrl = siteUrl();
  const href = `/${kind}/${slug}`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": kind === "atleta" ? "Person" : "SportsTeam",
        name: participant.name,
        url: `${baseUrl}${href}`,
        image: participant.logo,
        sport,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
          { "@type": "ListItem", position: 2, name: sport, item: `${baseUrl}/deporte/${sportSlug}` },
          { "@type": "ListItem", position: 3, name: participant.name, item: `${baseUrl}${href}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `¿Cuándo juega ${participant.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: upcoming[0]
                ? `El próximo partido de ${participant.name} es ${eventTitle(upcoming[0])} (${upcoming[0].league}). Tiene ${upcoming.length} encuentro${upcoming.length === 1 ? "" : "s"} próximos en agenda.`
                : `No hay próximos partidos confirmados de ${participant.name} en la agenda actual.`,
            },
          },
          {
            "@type": "Question",
            name: `¿En qué competiciones juega ${participant.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: leagues.length
                ? `${participant.name} aparece en: ${leagues.map(([, name]) => name).join(", ")}.`
                : "Competiciones por confirmar.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <section className={`page-hero sport-hero sport-${sportSlug} team-landing-hero`}>
        <div className="container">
          <BackLink href={`/deporte/${sportSlug}`} label={`Volver a ${sport}`} />
          <div className="breadcrumbs">
            <Link href="/">Inicio</Link> / <Link href={`/deporte/${sportSlug}`}>{sport}</Link> / {participant.name}
          </div>
          <div className="team-landing-head">
            <TeamLogo name={participant.name} src={participant.logo} size={88} />
            <div>
              <span className="eyebrow"><i /> {sport}</span>
              <h1>{participant.name}</h1>
              <p>
                {live.length} en vivo · {upcoming.length} próximos · {leagues.length} competiciones
              </p>
              <div className="hero-actions">
                <FavoriteTeamButton
                  team={{
                    slug,
                    name: participant.name,
                    logo: participant.logo,
                    href,
                    sportSlug,
                  }}
                />
              </div>
            </div>
          </div>
          {leagues.length > 0 && (
            <div className="team-league-chips">
              {leagues.map(([leagueSlug, name]) => (
                <Link key={leagueSlug} href={`/liga/${leagueSlug}`} className="team-league-chip">{name}</Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="container content-section">
        {live.length > 0 && (
          <section className="content-section" style={{ paddingTop: 0 }}>
            <div className="section-head"><div><span className="eyebrow"><i /> EN VIVO</span><h2>Ahora mismo</h2></div></div>
            <div className="events-grid">{live.map((event) => <EventCard event={event} key={event.id} />)}</div>
          </section>
        )}

        {byLeague.size > 0 ? (
          [...byLeague.entries()].map(([leagueSlug, leagueEvents]) => (
            <section className="content-section team-league-block" key={leagueSlug}>
              <div className="section-head">
                <div>
                  <span className="eyebrow"><i /> LIGA</span>
                  <h2>{leagueEvents[0].league}</h2>
                  <p>{leagueEvents.length} partido{leagueEvents.length === 1 ? "" : "s"} próximos / en vivo</p>
                </div>
                <Link className="section-link" href={`/liga/${leagueSlug}`}>Ver liga →</Link>
              </div>
              <div className="events-grid">
                {leagueEvents.map((event) => <EventCard event={event} key={event.id} />)}
              </div>
            </section>
          ))
        ) : (
          <div className="empty-state">No hay próximos partidos disponibles.</div>
        )}

        {finished.length > 0 && (
          <section className="content-section">
            <div className="section-head"><div><h2>Resultados recientes</h2></div></div>
            <div className="events-grid">{finished.slice(0, 12).map((event) => <EventCard event={event} key={event.id} />)}</div>
          </section>
        )}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
    </>
  );
}
