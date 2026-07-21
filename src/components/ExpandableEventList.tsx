"use client";

import { useMemo, useState } from "react";
import { EventCard } from "@/components/EventCard";
import type { SportsEvent } from "@/lib/types";

export function ExpandableEventList({
  events,
  title,
  eyebrow,
  emptyText = "No hay eventos en esta sección.",
  initialCount = 15,
  enableTeamFilter = true,
}: {
  events: SportsEvent[];
  title: string;
  eyebrow?: string;
  emptyText?: string;
  initialCount?: number;
  enableTeamFilter?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [team, setTeam] = useState("all");

  const teams = useMemo(() => {
    const map = new Map<string, string>();
    for (const event of events) {
      for (const side of [event.home, event.away]) {
        if (side.slug && side.name) map.set(side.slug, side.name);
      }
      for (const p of event.participants || []) {
        if (p.slug && p.name) map.set(p.slug, p.name);
      }
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1], "es"));
  }, [events]);

  const filtered = useMemo(() => {
    if (team === "all") return events;
    return events.filter((event) => {
      if (event.home.slug === team || event.away.slug === team) return true;
      return event.participants?.some((p) => p.slug === team);
    });
  }, [events, team]);

  const visible = expanded ? filtered : filtered.slice(0, initialCount);
  const hasMore = filtered.length > initialCount;

  return (
    <section className="content-section expandable-events" style={{ paddingTop: 0 }}>
      <div className="section-head expandable-head">
        <div>
          {eyebrow && <span className="eyebrow"><i /> {eyebrow}</span>}
          <h2>{title}</h2>
          <p>{filtered.length} partido{filtered.length === 1 ? "" : "s"}</p>
        </div>
        {enableTeamFilter && teams.length > 2 && (
          <label className="team-filter">
            <span>Equipo</span>
            <select value={team} onChange={(e) => { setTeam(e.target.value); setExpanded(false); }}>
              <option value="all">Todos</option>
              {teams.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
            </select>
          </label>
        )}
      </div>
      {visible.length ? (
        <div className="events-grid">{visible.map((event) => <EventCard event={event} key={event.id} />)}</div>
      ) : (
        <div className="empty-state">{emptyText}</div>
      )}
      {hasMore && (
        <div className="expand-actions">
          <button type="button" className="secondary-btn" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Ver menos" : `Ver todo (${filtered.length})`}
          </button>
        </div>
      )}
    </section>
  );
}
