import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { BroadcastGuide } from "@/components/BroadcastGuide";
import { Countdown } from "@/components/Countdown";
import { EventActions } from "@/components/EventActions";
import { EventCard } from "@/components/EventCard";
import { LocalTime } from "@/components/LocalTime";
import { TeamLogo } from "@/components/TeamLogo";
import { fetchEspnBroadcasts } from "@/lib/espn";
import { getEvent, readStore } from "@/lib/store";
import { eventTitle, formatEventDate, formatEventTime, isPubliclyVisible, siteUrl } from "@/lib/utils";

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
  const name = eventTitle(event);
  const title = `Dónde ver ${name} gratis`;
  const description = `¿Dónde ver gratis ${name}? Consulta horario, fecha y opciones para seguir el evento de ${event.league}.`;
  return {
    title,
    description,
    keywords: [
      `ver ${name}`,
      `dónde ver ${name} gratis`,
      `${name} gratis`,
      `${name} dónde ver`,
      `${name} horario`,
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
  const broadcasts = await fetchEspnBroadcasts(event);
  const data = await readStore();
  const related = data.events.filter((item) => item.id !== event.id && isPubliclyVisible(item) && (item.sportSlug === event.sportSlug || item.leagueSlug === event.leagueSlug) && !item.hidden).slice(0, 2);
  const isLive = event.status === "live";
  const name = eventTitle(event);
  const baseUrl = siteUrl();
  const eventUrl = `${baseUrl}/partido/${event.slug}`;
  const broadcasterNames = broadcasts.map((item) => item.name).join(", ");
  const whereToWatch = broadcasterNames
    ? `${name} se transmite por ${broadcasterNames}. La disponibilidad puede variar según tu país.`
    : `Los canales para ver ${name} aún están por confirmar. Esta página se actualizará automáticamente cuando la transmisión esté disponible para tu región.`;
  const freeViewing = `Si existe una señal gratuita para ${name} en tu país, la publicaremos aquí. La disponibilidad depende de los derechos de transmisión de cada región.`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsEvent",
        "@id": `${eventUrl}#event`,
        name,
        description: `${name} por ${event.league}. Consulta horario, sede, participantes y dónde verlo.`,
        url: eventUrl,
        image: [event.home.logo, event.away.logo].filter(Boolean),
        startDate: event.startsAt,
        eventStatus: isLive ? "https://schema.org/EventInProgress" : event.status === "finished" ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: event.venue ? { "@type": "Place", name: event.venue, address: { "@type": "PostalAddress", addressCountry: event.country } } : undefined,
        competitor: (event.participants?.length ? event.participants : [event.home, event.away]).map((participant) => ({ "@type": event.format === "multi" ? "Person" : "SportsTeam", name: participant.name, image: participant.logo })),
        organizer: { "@type": "SportsOrganization", name: event.league },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
          { "@type": "ListItem", position: 2, name: event.sport, item: `${baseUrl}/deporte/${event.sportSlug}` },
          { "@type": "ListItem", position: 3, name: event.league, item: `${baseUrl}/liga/${event.leagueSlug}` },
          { "@type": "ListItem", position: 4, name, item: eventUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `¿Cuándo es ${name}?`,
            acceptedAnswer: { "@type": "Answer", text: `El evento está programado para ${formatEventDate(event.startsAt)} a las ${formatEventTime(event.startsAt)}.` },
          },
          {
            "@type": "Question",
            name: `¿Dónde se realiza ${name}?`,
            acceptedAnswer: { "@type": "Answer", text: event.venue ? `Se juega en ${event.venue}${event.country ? `, ${event.country}` : ""}.` : "La sede aún está por confirmar." },
          },
          {
            "@type": "Question",
            name: `¿Dónde ver ${name}?`,
            acceptedAnswer: { "@type": "Answer", text: whereToWatch },
          },
          {
            "@type": "Question",
            name: `¿Dónde ver gratis ${name}?`,
            acceptedAnswer: { "@type": "Answer", text: freeViewing },
          },
        ],
      },
    ],
  };

  return (
    <>
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><Link href="/">Inicio</Link> / <Link href={`/deporte/${event.sportSlug}`}>{event.sport}</Link> / {event.league}</div>
        <h1>Dónde ver {name} gratis</h1>
        <p>Horario, fecha, sede, participantes y opciones para seguir el evento de {event.league}.</p>
      </div></section>
      <div className="container detail-wrap">
        <div className="match-detail">
          <div className="detail-top"><Link href={`/liga/${event.leagueSlug}`}>{event.league}</Link><span>{event.status === "live" ? "En vivo" : event.status === "finished" ? "FINALIZADO" : <LocalTime iso={event.startsAt} mode="date" as="span" />}</span></div>
          {event.format === "multi" ? (
            <div className="detail-multi">
              <h2>{name}</h2>
              {event.status === "finished" && <span className="versus">FINALIZADO</span>}
              <ol className="detail-leaderboard">
                {(event.participants || []).map((participant, index) => (
                  <li key={`${participant.slug}-${index}`}>
                    <span>{participant.position || index + 1}</span>
                    <TeamLogo name={participant.name} src={participant.logo} size={42} />
                    <strong>{participant.name}</strong>
                    {participant.score !== undefined && <b>{participant.score}</b>}
                  </li>
                ))}
              </ol>
              {event.status === "upcoming" && <Countdown startsAt={event.startsAt} />}
              <a className="disabled-watch transmission-link" href="#donde-se-transmite">Dónde se transmite</a>
            </div>
          ) : <div className="detail-scoreboard">
            <Link className="detail-team" href={`/equipo/${event.home.slug}`}><TeamLogo name={event.home.name} src={event.home.logo} size={84} /><h2>{event.home.name}</h2></Link>
            <div className="detail-center">
              {isLive ? (
                <><span className="live-badge"><i /> {event.minute}</span><b className="score">{event.home.score ?? 0} – {event.away.score ?? 0}</b></>
              ) : event.status === "finished" ? (
                <><b className="score">{event.home.score ?? 0} – {event.away.score ?? 0}</b><span className="versus">FINALIZADO</span></>
              ) : (
                <><LocalTime iso={event.startsAt} mode="time" /><span className="versus">VS</span><Countdown startsAt={event.startsAt} /></>
              )}
              <a className="disabled-watch transmission-link" href="#donde-se-transmite">Dónde se transmite</a>
            </div>
            <Link className="detail-team" href={`/equipo/${event.away.slug}`}><TeamLogo name={event.away.name} src={event.away.logo} size={84} /><h2>{event.away.name}</h2></Link>
          </div>}
          <div className="detail-info-grid">
            <div><small>Fecha y hora local</small><strong><LocalTime iso={event.startsAt} mode="datetime" as="span" /></strong></div>
            <div><small>Sede</small><strong>{event.venue || "Por confirmar"}</strong></div>
            <div><small>País</small><strong>{event.country || "Por confirmar"}</strong></div>
          </div>
        </div>
        <EventActions event={event} />
        <AdSlot banner={data.banners.find((banner) => banner.position === "detail") || data.banners.find((banner) => banner.position === "feed")} />
        <section className="answer-panel" id="donde-se-transmite">
          <span className="eyebrow"><i /> Respuesta rápida</span>
          <h2>¿Dónde se transmite {name}?</h2>
          <p>{whereToWatch}</p>
          <BroadcastGuide broadcasts={broadcasts} />
          <h3>¿Se puede ver gratis?</h3>
          <p>{freeViewing}</p>
          <div className="quick-facts">
            <div><small>¿Cuándo juegan?</small><strong><LocalTime iso={event.startsAt} mode="datetime" as="span" /></strong></div>
            <div><small>¿En qué competición?</small><strong>{event.league}</strong></div>
            <div><small>¿Dónde se juega?</small><strong>{event.venue || "Sede por confirmar"}{event.country ? `, ${event.country}` : ""}</strong></div>
          </div>
          <p className="editorial-note">Dónde Juega revisa la agenda y ordena los eventos según su relevancia para Latinoamérica. Esta página se actualiza automáticamente cuando cambian el horario, el estado, la sede o las alineaciones disponibles. No alojamos transmisiones ni enlazamos señales no autorizadas.</p>
          <p className="data-trust">Última actualización: <LocalTime iso={event.updatedAt} mode="datetime" as="span" /> · Fuente: {event.source === "thesportsdb" ? "TheSportsDB y revisión editorial" : "Equipo editorial de Dónde Juega"}.</p>
        </section>
        {event.format !== "multi" && <div className="lineups">
          <div className="panel"><h2>Alineación de {event.home.name}</h2>{event.homeLineup?.length ? <ul className="lineup-list">{event.homeLineup.map((player) => <li key={player.name}><span>{player.number} {player.name}</span><small>{player.position}</small></li>)}</ul> : <p>La alineación aún no está disponible.</p>}</div>
          <div className="panel"><h2>Alineación de {event.away.name}</h2>{event.awayLineup?.length ? <ul className="lineup-list">{event.awayLineup.map((player) => <li key={player.name}><span>{player.number} {player.name}</span><small>{player.position}</small></li>)}</ul> : <p>La alineación aún no está disponible.</p>}</div>
        </div>}
        {related.length > 0 && <section className="content-section"><div className="section-head"><div><h2>También puede interesarte</h2></div></div><div className="events-grid">{related.map((item) => <EventCard event={item} key={item.id} />)}</div></section>}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
    </>
  );
}
