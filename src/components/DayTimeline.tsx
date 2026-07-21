"use client";

import Link from "next/link";
import type { SportsEvent } from "@/lib/types";
import { LocalTime } from "./LocalTime";

export function DayTimeline({ events }: { events: SportsEvent[] }) {
  const hours = Array.from({ length: 20 }, (_, i) => i + 6);
  const byHour = new Map<number, SportsEvent[]>();
  for (const event of events) {
    const h = new Date(event.startsAt).getHours();
    const list = byHour.get(h) || [];
    list.push(event);
    byHour.set(h, list);
  }

  return (
    <div className="day-timeline">
      {hours.map((hour) => {
        const slotEvents = byHour.get(hour) || [];
        return (
          <div className="day-timeline-slot" key={hour}>
            <span className="day-timeline-hour">{hour.toString().padStart(2, "0")}:00</span>
            <div className="day-timeline-events">
              {slotEvents.length ? slotEvents.map((event) => (
                <Link href={`/partido/${event.slug}`} className="day-timeline-event" key={event.id}>
                  <LocalTime iso={event.startsAt} mode="time" />
                  <strong>{event.home.name} vs {event.away.name}</strong>
                  <small>{event.league}{event.roundLabel ? ` · ${event.roundLabel}` : ""}</small>
                </Link>
              )) : <span className="day-timeline-empty">—</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
