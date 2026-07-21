import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { BackLink } from "@/components/BackLink";
import { BroadcastGuide } from "@/components/BroadcastGuide";
import { Countdown } from "@/components/Countdown";
import { EventActions } from "@/components/EventActions";
import { EventCard } from "@/components/EventCard";
import {
  ContestsPanel,
  LeadersPanel,
  ParticipantLink,
  PlaysPanel,
  PredictorPanel,
  RosterPanels,
  SegmentScoreboard,
  StandingsPanel,
  StatsPanels,
  TimelinePanel,
} from "@/components/event-details/SportSections";
import { LocalTime } from "@/components/LocalTime";
import { TeamLogo } from "@/components/TeamLogo";
import { resolveDisplayPhase } from "@/lib/event-phase";
import { fetchEventDetails } from "@/lib/event-details";
import { isEsport, isIndividualSport } from "@/lib/sports";
import { readStore } from "@/lib/store";
import { ensureLiveScores, resolveEvent } from "@/lib/sync";
import { eventTitle, formatEventDate, formatEventTime, isPubliclyVisible, siteUrl } from "@/lib/utils";
import { matchupSlug } from "@/lib/vs";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  const data = await readStore();
  return data.events.filter((event) => !event.hidden).map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await resolveEvent(slug);
  if (!event) return { title: "Evento no encontrado" };
  const name = eventTitle(event);
  const phaseLabel = resolveDisplayPhase(event);
  const title = phaseLabel ? `Ver ${name} gratis — ${phaseLabel}` : `Ver ${name} gratis`;
  const description = phaseLabel
    ? `¿Dónde ver gratis ${name} (${phaseLabel})? Horario, sede, estadísticas y canales para ${event.league}.`
    : `¿Dónde ver gratis ${name}? Consulta horario, fecha, estadísticas y opciones para seguir el evento de ${event.league}.`;
  return {
    title,
    description,
    keywords: [
      `ver ${name}`,
      `ver ${name} gratis`,
      `dónde ver ${name} gratis`,
      `${name} gratis`,
      `${name} dónde ver`,
      `${name} horario`,
      `${name} ${event.sport}`,
      `${event.home.name} vs ${event.away.name} ${event.sport}`,
      event.league,
      phaseLabel || "",
    ].filter(Boolean),
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
  const event = await resolveEvent(slug);
  if (!event) notFound();
  await ensureLiveScores();
  const details = await fetchEventDetails(event);
  const broadcasts = details.broadcasts?.length ? details.broadcasts : event.broadcasts || [];
  const data = await readStore();
  const related = data.events
    .filter((item) => item.id !== event.id && isPubliclyVisible(item) && (item.sportSlug === event.sportSlug || item.leagueSlug === event.leagueSlug) && !item.hidden)
    .slice(0, 2);
  const isLive = details.status.state === "live" || event.status === "live";
  const isFinished = details.status.state === "finished" || event.status === "finished";
  const name = eventTitle(event);
  const phaseLabel = resolveDisplayPhase(event) || details.roundLabel;
  const individual = isIndividualSport(event);
  const esport = isEsport(event);
  const sportHref = esport ? `/esports/${event.sportSlug}` : `/deporte/${event.sportSlug}`;
  const sourceName = event.source === "pandascore" ? "PandaScore" : "ESPN";
  const competitorType = individual ? "Person" : "SportsTeam";
  const baseUrl = siteUrl();
  const eventUrl = `${baseUrl}/partido/${event.slug}`;
  const broadcasterNames = broadcasts.map((item) => item.name).join(", ");
  const whereToWatch = broadcasterNames
    ? `${name} se transmite por ${broadcasterNames}. La disponibilidad puede variar según tu país.`
    : `Los canales para ver ${name} aún están por confirmar. Esta página se actualizará automáticamente cuando la transmisión esté disponible para tu región.`;
  const freeViewing = `Si existe una señal gratuita para ${name} en tu país, la publicaremos aquí. La disponibilidad depende de los derechos de transmisión de cada región.`;
  const homeRaw = details.participants.find((item) => item.side === "home") || details.participants[0];
  const awayRaw = details.participants.find((item) => item.side === "away") || details.participants[1];
  const home = {
    id: homeRaw?.id || event.home.slug,
    name: homeRaw?.name || event.home.name,
    slug: homeRaw?.slug || event.home.slug,
    logo: homeRaw?.logo || event.home.logo,
    score: homeRaw?.score ?? event.home.score,
  };
  const away = {
    id: awayRaw?.id || event.away.slug,
    name: awayRaw?.name || event.away.name,
    slug: awayRaw?.slug || event.away.slug,
    logo: awayRaw?.logo || event.away.logo,
    score: awayRaw?.score ?? event.away.score,
  };
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsEvent",
        "@id": `${eventUrl}#event`,
        name: phaseLabel ? `${name} — ${phaseLabel}` : name,
        description: `${name}${phaseLabel ? ` (${phaseLabel})` : ""} por ${event.league}. Consulta horario, sede, estadísticas y dónde verlo.`,
        url: eventUrl,
        image: [home.logo, away.logo].filter(Boolean),
        startDate: event.startsAt,
        eventStatus: isLive ? "https://schema.org/EventInProgress" : isFinished ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: event.venue ? { "@type": "Place", name: event.venue, address: { "@type": "PostalAddress", addressCountry: event.country } } : undefined,
        competitor: (details.standings?.length ? details.standings.map((item) => item.participant) : details.participants).map((participant) => ({
          "@type": competitorType,
          name: participant.name,
          image: participant.logo,
        })),
        organizer: { "@type": "SportsOrganization", name: event.league },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
          { "@type": "ListItem", position: 2, name: event.sport, item: `${baseUrl}${sportHref}` },
          { "@type": "ListItem", position: 3, name: event.league, item: `${baseUrl}/liga/${event.leagueSlug}` },
          { "@type": "ListItem", position: 4, name, item: eventUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          ...(phaseLabel ? [{
            "@type": "Question",
            name: `¿Qué fase del torneo es ${name}?`,
            acceptedAnswer: { "@type": "Answer", text: `${name} corresponde a ${phaseLabel} de ${event.league}.` },
          }] : []),
          {
            "@type": "Question",
            name: `¿Cuándo es ${name}?`,
            acceptedAnswer: { "@type": "Answer", text: `El evento está programado para ${formatEventDate(event.startsAt)} a las ${formatEventTime(event.startsAt)}.` },
          },
          {
            "@type": "Question",
            name: details.labels.whereLabel,
            acceptedAnswer: { "@type": "Answer", text: event.venue ? `Se realiza en ${event.venue}${event.country ? `, ${event.country}` : ""}.` : "La sede aún está por confirmar." },
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
        <BackLink href={`/liga/${event.leagueSlug}`} label={`Volver a ${event.league}`} />
        <div className="breadcrumbs"><Link href="/">Inicio</Link> / <Link href={sportHref}>{event.sport}</Link> / <Link href={`/liga/${event.leagueSlug}`}>{event.league}</Link></div>
        <h1>Ver {name}{phaseLabel ? ` — ${phaseLabel}` : ""}</h1>
        <p>
          Horario, sede, estadísticas y opciones para seguir el evento de {event.league}.
          {!esport && event.format !== "multi" && (
            <> {" "}
              <Link href={`/vs/${matchupSlug(home.name, away.name)}`}>Ver historial {home.name} vs {away.name} →</Link>
            </>
          )}
        </p>
      </div></section>
      <div className="container detail-wrap">
        <div className="match-detail">
          <div className="detail-top">
            <Link href={`/liga/${event.leagueSlug}`}>{event.league}{phaseLabel ? ` · ${phaseLabel}` : ""}</Link>
            <span>
              {isLive ? (details.status.clock || details.status.label || event.minute || "En vivo") : isFinished ? "FINALIZADO" : <LocalTime iso={event.startsAt} mode="date" as="span" />}
            </span>
          </div>
          {details.family === "racing" || details.family === "golf" || event.format === "multi" ? (
            <div className="detail-multi">
              <h2>{name}</h2>
              {details.roundLabel && <span className="versus">{details.roundLabel}</span>}
              {isFinished && <span className="versus">FINALIZADO</span>}
              <ol className="detail-leaderboard">
                {(details.standings || []).slice(0, 12).map((entry, index) => (
                  <li key={`${entry.participant.id}-${index}`}>
                    <span>{entry.position || index + 1}</span>
                    <TeamLogo name={entry.participant.name} src={entry.participant.logo} size={42} />
                    <strong>{entry.participant.name}</strong>
                    {entry.score !== undefined && <b>{entry.score}</b>}
                  </li>
                ))}
              </ol>
              {!isFinished && event.status === "upcoming" && <Countdown startsAt={event.startsAt} />}
              <a className="disabled-watch transmission-link" href="#donde-se-transmite">Dónde se transmite</a>
            </div>
          ) : (
            <div className="detail-scoreboard">
              <ParticipantLink event={event} name={home.name} slug={home.slug} logo={home.logo} />
              <div className="detail-center">
                {details.roundLabel && <span className="event-round">{details.roundLabel}</span>}
                {isLive ? (
                  <>
                    <span className="live-badge"><i /> {details.status.clock || details.status.label || event.minute || "EN VIVO"}</span>
                    <b className="score">{home.score ?? 0} – {away.score ?? 0}</b>
                  </>
                ) : isFinished ? (
                  <>
                    <b className="score">{home.score ?? 0} – {away.score ?? 0}</b>
                    <span className="versus">FINALIZADO</span>
                  </>
                ) : (
                  <>
                    <LocalTime iso={event.startsAt} mode="time" />
                    <span className="versus">VS</span>
                    <Countdown startsAt={event.startsAt} />
                  </>
                )}
                <a className="disabled-watch transmission-link" href="#donde-se-transmite">Dónde se transmite</a>
              </div>
              <ParticipantLink event={event} name={away.name} slug={away.slug} logo={away.logo} />
            </div>
          )}
          <div className="detail-info-grid">
            <div><small>Fecha y hora local</small><strong><LocalTime iso={event.startsAt} mode="datetime" as="span" /></strong></div>
            <div><small>Sede</small><strong>{event.venue || "Por confirmar"}</strong></div>
            <div><small>País / ciudad</small><strong>{event.country || "Por confirmar"}</strong></div>
          </div>
        </div>
        <EventActions event={event} />
        <AdSlot banner={data.banners.find((banner) => banner.position === "detail") || data.banners.find((banner) => banner.position === "feed")} />
        <PredictorPanel details={details} event={event} />
        <SegmentScoreboard details={details} />
        <ContestsPanel details={details} />
        <StandingsPanel details={details} />
        <StatsPanels details={details} />
        <LeadersPanel details={details} />
        <TimelinePanel details={details} />
        <PlaysPanel details={details} />
        <RosterPanels details={details} event={event} />
        <section className="answer-panel" id="donde-se-transmite">
          <span className="eyebrow"><i /> Respuesta rápida</span>
          <h2>¿Dónde se transmite {name}?</h2>
          <p>{whereToWatch}</p>
          <BroadcastGuide broadcasts={broadcasts} />
          <h3>¿Se puede ver gratis?</h3>
          <p>{freeViewing}</p>
          <div className="quick-facts">
            <div><small>{details.labels.whenLabel}</small><strong><LocalTime iso={event.startsAt} mode="datetime" as="span" /></strong></div>
            <div><small>¿En qué competición?</small><strong>{event.league}</strong></div>
            <div><small>{details.labels.whereLabel}</small><strong>{event.venue || "Sede por confirmar"}{event.country ? `, ${event.country}` : ""}</strong></div>
          </div>
          <p className="editorial-note">Dónde Juega revisa la agenda y ordena los eventos según su relevancia para Latinoamérica. Esta página se actualiza automáticamente cuando cambian el horario, el estado, la sede o las estadísticas disponibles. No alojamos transmisiones ni enlazamos señales no autorizadas.</p>
          <p className="data-trust">Última actualización: <LocalTime iso={details.updatedAt || event.updatedAt} mode="datetime" as="span" /> · Fuente: {sourceName} / revisión editorial de Dónde Juega.</p>
        </section>
        {related.length > 0 && (
          <section className="content-section">
            <div className="section-head"><div><h2>También puede interesarte</h2></div></div>
            <div className="events-grid">{related.map((item) => <EventCard event={item} key={item.id} />)}</div>
          </section>
        )}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
    </>
  );
}
