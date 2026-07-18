import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import type { SportsEvent } from "@/lib/types";
import { formatEventSchedule } from "@/lib/utils";
import { Countdown } from "./Countdown";
import { FavoriteButton } from "./FavoriteButton";
import { TeamLogo } from "./TeamLogo";

export function EventCard({ event, compact = false }: { event: SportsEvent; compact?: boolean }) {
  const isLive = event.status === "live";
  const isUpcoming = event.status === "upcoming";
  const schedule = formatEventSchedule(event.startsAt);
  const showCountdown = isUpcoming || Boolean(event.featured && isUpcoming);
  return (
    <article className={`event-card ${isLive ? "is-live" : ""} ${event.featured ? "is-featured" : ""} ${compact ? "is-compact" : ""}`}>
      <div className="event-card-top">
        <Link href={`/liga/${event.leagueSlug}`} className="league-label">{event.league}</Link>
        <div className="event-meta-actions">
          {event.featured && <span className="featured-tag">DESTACADO</span>}
          <FavoriteButton eventId={event.id} />
        </div>
      </div>
      <Link href={`/partido/${event.slug}`} className="event-card-body">
        <div className="event-team">
          <TeamLogo name={event.home.name} src={event.home.logo} size={compact ? 38 : 48} />
          <strong>{event.home.name}</strong>
        </div>
        <div className="event-center">
          {isLive ? (
            <>
              <span className="live-badge"><i /> {event.minute || "EN VIVO"}</span>
              <b className="score">{event.home.score ?? 0} - {event.away.score ?? 0}</b>
              <time dateTime={event.startsAt} className="event-when-mini">{schedule.label}</time>
            </>
          ) : (
            <>
              <time dateTime={event.startsAt} className="event-when">
                <span className="event-when-day">{schedule.day}</span>
                <span className="event-when-time">{schedule.time}</span>
              </time>
              <span className="versus">{event.status === "finished" ? "FINAL" : "VS"}</span>
              {showCountdown && <Countdown startsAt={event.startsAt} />}
            </>
          )}
        </div>
        <div className="event-team away">
          <TeamLogo name={event.away.name} src={event.away.logo} size={compact ? 38 : 48} />
          <strong>{event.away.name}</strong>
        </div>
      </Link>
      <div className="event-card-footer">
        <span>{event.venue ? <><MapPin size={14} /> {event.venue}</> : <><CalendarDays size={14} /> {schedule.label}</>}</span>
        <Link href={`/partido/${event.slug}`} className="watch-btn" aria-label={`Ver detalles de ${event.home.name} contra ${event.away.name}`}>
          Dónde ver <ChevronRight size={15} />
        </Link>
      </div>
    </article>
  );
}
