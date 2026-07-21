import { EventCard } from "@/components/EventCard";
import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { LocalTime } from "@/components/LocalTime";
import { TeamLogo } from "@/components/TeamLogo";
import { resolveDisplayPhase } from "@/lib/event-phase";
import type { SportsEvent } from "@/lib/types";
import { eventTitle } from "@/lib/utils";

export function LandingHeroCard({ event }: { event: SportsEvent }) {
  const title = eventTitle(event);
  const phase = resolveDisplayPhase(event);
  return (
    <Link href={`/partido/${event.slug}`} className="game-hero-card landing-hero-card">
      {phase && <span className="phase-badge phase-badge-hero">{phase}</span>}
      {event.format === "multi" ? (
        <div className="hero-multi">
          <h2>{title}</h2>
          <span>{event.participants?.slice(0, 3).map((p) => p.name).join(" · ") || "Participantes"}</span>
        </div>
      ) : (
        <div className="game-hero-teams">
          <span className="game-hero-team">
            <TeamLogo name={event.home.name} src={event.home.logo} size={52} />
            <strong>{event.home.name}</strong>
          </span>
          <span className="game-hero-center">
            {event.status === "live" ? (
              <>
                <span className="live-badge"><i /> {event.minute || "EN VIVO"}</span>
                <b className="score">{event.home.score ?? 0} – {event.away.score ?? 0}</b>
              </>
            ) : event.status === "finished" ? (
              <>
                <span className="versus">FINALIZADO</span>
                <b className="score">{event.home.score ?? 0} – {event.away.score ?? 0}</b>
              </>
            ) : (
              <>
                <LocalTime iso={event.startsAt} mode="datetime-short" />
                <Countdown startsAt={event.startsAt} />
              </>
            )}
          </span>
          <span className="game-hero-team">
            <TeamLogo name={event.away.name} src={event.away.logo} size={52} />
            <strong>{event.away.name}</strong>
          </span>
        </div>
      )}
      <small>{event.league}</small>
    </Link>
  );
}

export function EventSections({
  live,
  upcoming,
  finished,
}: {
  live: SportsEvent[];
  upcoming: SportsEvent[];
  finished: SportsEvent[];
}) {
  return (
    <>
      {live.length > 0 && (
        <section className="content-section" style={{ paddingTop: 0 }}>
          <div className="section-head"><div><span className="eyebrow"><i /> EN VIVO</span><h2>En vivo ahora</h2></div></div>
          <div className="events-grid">{live.map((event) => <EventCard event={event} key={event.id} />)}</div>
        </section>
      )}
      <section className="content-section" style={{ paddingTop: live.length ? undefined : 0 }}>
        <div className="section-head"><div><h2>Próximos</h2><p>{upcoming.length} en agenda</p></div></div>
        {upcoming.length
          ? <div className="events-grid">{upcoming.map((event) => <EventCard event={event} key={event.id} />)}</div>
          : <div className="empty-state">No hay eventos próximos en este momento.</div>}
      </section>
      {finished.length > 0 && (
        <section className="content-section">
          <div className="section-head"><div><h2>Finalizados recientemente</h2></div></div>
          <div className="events-grid">{finished.slice(0, 8).map((event) => <EventCard event={event} key={event.id} />)}</div>
        </section>
      )}
    </>
  );
}
