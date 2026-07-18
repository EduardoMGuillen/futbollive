import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { Countdown } from "@/components/Countdown";
import { EventActions } from "@/components/EventActions";
import { EventCard } from "@/components/EventCard";
import { TeamLogo } from "@/components/TeamLogo";
import { getEvent, readStore } from "@/lib/store";
import { formatEventDate, formatEventTime, siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  const data = await readStore();
  return data.events.filter((event) => !event.hidden).map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Partido no encontrado" };
  const title = `Ver ${event.home.name} vs ${event.away.name}: horario y dónde ver`;
  const description = `¿Dónde ver ${event.home.name} vs ${event.away.name}? Consulta la hora, fecha, sede, alineaciones y opciones legales del partido de ${event.league}.`;
  return {
    title,
    description,
    keywords: [
      `ver ${event.home.name} vs ${event.away.name}`,
      `${event.home.name} vs ${event.away.name} dónde ver`,
      `${event.home.name} vs ${event.away.name} horario`,
      `partido ${event.home.name} ${event.away.name}`,
      event.league,
    ],
    alternates: { canonical: `/partido/${event.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/partido/${event.slug}`,
      images: event.home.logo ? [{ url: event.home.logo, alt: event.home.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: event.home.logo ? [event.home.logo] : undefined },
    robots: { index: true, follow: true },
  };
}

export default async function MatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();
  const data = await readStore();
  const related = data.events.filter((item) => item.id !== event.id && item.status !== "finished" && (item.sportSlug === event.sportSlug || item.leagueSlug === event.leagueSlug) && !item.hidden).slice(0, 2);
  const isLive = event.status === "live";
  const eventUrl = `${siteUrl()}/partido/${event.slug}`;
  const whereToWatch = `Las opciones legales para ver ${event.home.name} vs ${event.away.name} se publicarán aquí cuando estén verificadas para tu región.`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsEvent",
        "@id": `${eventUrl}#event`,
        name: `${event.home.name} vs ${event.away.name}`,
        description: `${event.home.name} se enfrenta a ${event.away.name} por ${event.league}. Consulta horario, sede, alineaciones y dónde verlo legalmente.`,
        url: eventUrl,
        image: [event.home.logo, event.away.logo].filter(Boolean),
        startDate: event.startsAt,
        eventStatus: isLive ? "https://schema.org/EventInProgress" : event.status === "finished" ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: event.venue ? { "@type": "Place", name: event.venue, address: { "@type": "PostalAddress", addressCountry: event.country } } : undefined,
        competitor: [event.home, event.away].map((team) => ({ "@type": "SportsTeam", name: team.name, image: team.logo })),
        organizer: { "@type": "SportsOrganization", name: event.league },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
          { "@type": "ListItem", position: 2, name: event.sport, item: `${siteUrl}/deporte/${event.sportSlug}` },
          { "@type": "ListItem", position: 3, name: event.league, item: `${siteUrl}/liga/${event.leagueSlug}` },
          { "@type": "ListItem", position: 4, name: `${event.home.name} vs ${event.away.name}`, item: eventUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `¿Cuándo juegan ${event.home.name} vs ${event.away.name}?`,
            acceptedAnswer: { "@type": "Answer", text: `El partido está programado para ${formatEventDate(event.startsAt)} a las ${formatEventTime(event.startsAt)}.` },
          },
          {
            "@type": "Question",
            name: `¿Dónde se juega ${event.home.name} vs ${event.away.name}?`,
            acceptedAnswer: { "@type": "Answer", text: event.venue ? `Se juega en ${event.venue}${event.country ? `, ${event.country}` : ""}.` : "La sede aún está por confirmar." },
          },
          {
            "@type": "Question",
            name: `¿Dónde ver ${event.home.name} vs ${event.away.name}?`,
            acceptedAnswer: { "@type": "Answer", text: whereToWatch },
          },
        ],
      },
    ],
  };

  return (
    <>
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><Link href="/">Inicio</Link> / <Link href={`/deporte/${event.sportSlug}`}>{event.sport}</Link> / {event.league}</div>
        <h1>Ver {event.home.name} vs {event.away.name}: horario y dónde ver</h1>
        <p>Información actualizada del partido de {event.league}: fecha, hora local, sede, alineaciones y opciones legales de transmisión.</p>
      </div></section>
      <div className="container detail-wrap">
        <div className="match-detail">
          <div className="detail-top"><Link href={`/liga/${event.leagueSlug}`}>{event.league}</Link><span>{event.status === "live" ? "En vivo" : formatEventDate(event.startsAt)}</span></div>
          <div className="detail-scoreboard">
            <Link className="detail-team" href={`/equipo/${event.home.slug}`}><TeamLogo name={event.home.name} src={event.home.logo} size={84} /><h2>{event.home.name}</h2></Link>
            <div className="detail-center">
              {isLive ? (
                <><span className="live-badge"><i /> {event.minute}</span><b className="score">{event.home.score ?? 0} – {event.away.score ?? 0}</b></>
              ) : event.status === "finished" ? (
                <><b className="score">{event.home.score ?? 0} – {event.away.score ?? 0}</b><span className="versus">FINAL</span></>
              ) : (
                <><time>{formatEventTime(event.startsAt)}</time><span className="versus">VS</span><Countdown startsAt={event.startsAt} /></>
              )}
              <button className="disabled-watch" disabled>{event.status === "finished" ? "Partido finalizado" : "Ver partido · Próximamente"}</button>
            </div>
            <Link className="detail-team" href={`/equipo/${event.away.slug}`}><TeamLogo name={event.away.name} src={event.away.logo} size={84} /><h2>{event.away.name}</h2></Link>
          </div>
          <div className="detail-info-grid">
            <div><small>Fecha y hora local</small><strong>{formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt)}</strong></div>
            <div><small>Sede</small><strong>{event.venue || "Por confirmar"}</strong></div>
            <div><small>País</small><strong>{event.country || "Por confirmar"}</strong></div>
          </div>
        </div>
        <EventActions event={event} />
        <AdSlot banner={data.banners.find((banner) => banner.position === "detail") || data.banners.find((banner) => banner.position === "feed")} />
        <section className="answer-panel">
          <span className="eyebrow"><i /> Respuesta rápida</span>
          <h2>¿Dónde ver {event.home.name} vs {event.away.name}?</h2>
          <p>{whereToWatch}</p>
          <div className="quick-facts">
            <div><small>¿Cuándo juegan?</small><strong>{formatEventDate(event.startsAt)} a las {formatEventTime(event.startsAt)}</strong></div>
            <div><small>¿En qué competición?</small><strong>{event.league}</strong></div>
            <div><small>¿Dónde se juega?</small><strong>{event.venue || "Sede por confirmar"}{event.country ? `, ${event.country}` : ""}</strong></div>
          </div>
          <p className="editorial-note">Dónde Juega revisa la agenda y ordena los eventos según su relevancia para Latinoamérica. Esta página se actualiza automáticamente cuando cambian el horario, el estado, la sede o las alineaciones disponibles. No alojamos transmisiones ni enlazamos señales no autorizadas.</p>
          <p className="data-trust">Última actualización: {new Intl.DateTimeFormat("es-419", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.updatedAt))} · Fuente: {event.source === "thesportsdb" ? "TheSportsDB y revisión editorial" : "Equipo editorial de Dónde Juega"}.</p>
        </section>
        <div className="lineups">
          <div className="panel"><h2>Alineación de {event.home.name}</h2>{event.homeLineup?.length ? <ul className="lineup-list">{event.homeLineup.map((player) => <li key={player.name}><span>{player.number} {player.name}</span><small>{player.position}</small></li>)}</ul> : <p>La alineación aún no está disponible.</p>}</div>
          <div className="panel"><h2>Alineación de {event.away.name}</h2>{event.awayLineup?.length ? <ul className="lineup-list">{event.awayLineup.map((player) => <li key={player.name}><span>{player.number} {player.name}</span><small>{player.position}</small></li>)}</ul> : <p>La alineación aún no está disponible.</p>}</div>
        </div>
        {related.length > 0 && <section className="content-section"><div className="section-head"><div><h2>También puede interesarte</h2></div></div><div className="events-grid">{related.map((item) => <EventCard event={item} key={item.id} />)}</div></section>}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
    </>
  );
}
