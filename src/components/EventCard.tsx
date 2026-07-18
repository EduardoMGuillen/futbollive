import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import type { SportsEvent } from "@/lib/types";
import { formatEventTime } from "@/lib/utils";
import { FavoriteButton } from "./FavoriteButton";
import { TeamLogo } from "./TeamLogo";

export function EventCard({ event, compact = false }: { event: SportsEvent; compact?: boolean }) {
  const isLive = event.status === "live";
  return (
    <article className={`event-card ${isLive ? "is-live" : ""} ${compact ? "is-compact" : ""}`}>
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
            </>
          ) : (
            <>
              <time>{formatEventTime(event.startsAt)}</time>
              <span className="versus">VS</span>
            </>
          )}
        </div>
        <div className="event-team away">
          <TeamLogo name={event.away.name} src={event.away.logo} size={compact ? 38 : 48} />
          <strong>{event.away.name}</strong>
        </div>
      </Link>
      <div className="event-card-footer">
        <span>{event.venue ? <><MapPin size={14} /> {event.venue}</> : <><CalendarDays size={14} /> Horario local</>}</span>
        <Link href={`/partido/${event.slug}`} className="watch-btn" aria-label={`Ver detalles de ${event.home.name} contra ${event.away.name}`}>
          Dónde ver <ChevronRight size={15} />
        </Link>
      </div>
    </article>
  );
}
