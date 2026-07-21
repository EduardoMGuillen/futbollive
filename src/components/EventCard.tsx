import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { resolveDisplayPhase } from "@/lib/event-phase";
import { isEsport } from "@/lib/sports";
import type { SportsEvent } from "@/lib/types";
import { eventTitle } from "@/lib/utils";
import { Countdown } from "./Countdown";
import { FavoriteButton } from "./FavoriteButton";
import { LocalSchedule, LocalTime } from "./LocalTime";
import { ShareButton } from "./ShareButton";
import { TeamLogo } from "./TeamLogo";

export function EventCard({ event, compact = false }: { event: SportsEvent; compact?: boolean }) {
  const isLive = event.status === "live";
  const isUpcoming = event.status === "upcoming";
  const showCountdown = isUpcoming || Boolean(event.featured && isUpcoming);
  const title = eventTitle(event);
  const phase = resolveDisplayPhase(event);
  const boLabel = isEsport(event) && event.bestOf ? `BO${event.bestOf}` : null;
  return (
    <article className={`event-card ${isLive ? "is-live" : ""} ${event.featured ? "is-featured" : ""} ${compact ? "is-compact" : ""}`}>
      <div className="event-card-top">
        <Link href={`/liga/${event.leagueSlug}`} className="league-label">{event.league}</Link>
        <div className="event-meta-actions">
          {boLabel && <span className="event-bo-chip">{boLabel}</span>}
          {phase && <span className="event-phase-chip">{phase}</span>}
          {event.featured && !phase && <span className="featured-tag">DESTACADO</span>}
          <FavoriteButton eventId={event.id} />
        </div>
      </div>
      {event.format === "multi" ? (
        <Link href={`/partido/${event.slug}`} className="event-card-body event-multi-body">
          <div className="multi-event-heading">
            {phase && <span className="event-phase-badge">{phase}</span>}
            <LocalTime iso={event.startsAt} mode="datetime-short" />
            <h3>{title}</h3>
            <span className={`versus ${event.status === "finished" ? "is-finished" : ""}`}>
              {isLive ? event.minute || "EN VIVO" : event.status === "finished" ? "FINALIZADO" : "PRÓXIMO"}
            </span>
          </div>
          {event.participants?.length ? (
            <ol className="mini-leaderboard">
              {event.participants.slice(0, 3).map((participant, index) => (
                <li key={`${participant.slug}-${index}`}>
                  <span>{participant.position || index + 1}</span>
                  <TeamLogo name={participant.name} src={participant.logo} size={30} />
                  <strong>{participant.name}</strong>
                  {participant.score !== undefined && <b>{participant.score}</b>}
                </li>
              ))}
            </ol>
          ) : <p className="multi-placeholder">Participantes por confirmar</p>}
          {showCountdown && <Countdown startsAt={event.startsAt} />}
        </Link>
      ) : (
      <Link href={`/partido/${event.slug}`} className="event-card-body">
        <div className="event-team">
          <TeamLogo name={event.home.name} src={event.home.logo} size={compact ? 38 : 48} />
          <strong>{event.home.name}</strong>
        </div>
        <div className="event-center">
          {phase && <span className="event-phase-badge">{phase}</span>}
          {isLive ? (
            <>
              <span className="live-badge"><i /> {event.minute || "EN VIVO"}</span>
              <b className="score">{event.home.score ?? 0} - {event.away.score ?? 0}</b>
              <LocalTime iso={event.startsAt} mode="datetime-short" className="event-when-mini" />
            </>
          ) : event.status === "finished" ? (
            <>
              <b className="score">{event.home.score ?? 0} - {event.away.score ?? 0}</b>
              <span className="versus">FINALIZADO</span>
              <LocalTime iso={event.startsAt} mode="datetime-short" className="event-when-mini" />
            </>
          ) : (
            <>
              <LocalSchedule iso={event.startsAt} />
              <span className="versus">VS</span>
              {showCountdown && <Countdown startsAt={event.startsAt} />}
            </>
          )}
        </div>
        <div className="event-team away">
          <TeamLogo name={event.away.name} src={event.away.logo} size={compact ? 38 : 48} />
          <strong>{event.away.name}</strong>
        </div>
      </Link>
      )}
      <div className="event-card-footer">
        <span>
          {event.venue
            ? <><MapPin size={14} /> {event.venue}</>
            : <><CalendarDays size={14} /> <LocalTime iso={event.startsAt} mode="datetime-short" as="span" /></>}
        </span>
        <Link href={`/partido/${event.slug}#donde-se-transmite`} className="watch-btn" aria-label={`Ver dónde se transmite ${title}`}>
          Dónde se transmite <ChevronRight size={15} />
        </Link>
        <ShareButton title={title} url={`/partido/${event.slug}`} />
      </div>
    </article>
  );
}
