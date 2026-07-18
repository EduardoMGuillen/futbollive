"use client";

import { CalendarPlus, Share2 } from "lucide-react";
import type { SportsEvent } from "@/lib/types";
import { eventDurationMs, eventTitle } from "@/lib/utils";

export function EventActions({ event }: { event: SportsEvent }) {
  const share = async () => {
    const data = { title: eventTitle(event), url: window.location.href };
    if (navigator.share) await navigator.share(data);
    else await navigator.clipboard.writeText(window.location.href);
  };
  const calendarUrl = () => {
    const start = new Date(event.startsAt);
    const end = new Date(start.getTime() + eventDurationMs(event));
    const clean = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle(event))}&dates=${clean(start)}/${clean(end)}&details=${encodeURIComponent(`Evento de ${event.league} en Dónde Juega`)}&location=${encodeURIComponent(event.venue || "")}`;
  };
  return (
    <div className="hero-actions">
      <button className="secondary-btn" onClick={share}><Share2 size={17} /> Compartir</button>
      <a className="secondary-btn" href={calendarUrl()} target="_blank" rel="noopener noreferrer"><CalendarPlus size={17} /> Agregar al calendario</a>
    </div>
  );
}
