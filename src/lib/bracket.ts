import type { EventPhase, SportsEvent } from "./types";
import { eventPhaseLabel, normalizePhase, phaseSortOrder } from "./event-phase";
import { eventTitle } from "./utils";

export type BracketColumn = {
  phase: EventPhase;
  title: string;
  matches: SportsEvent[];
};

const COLUMN_META: Array<{ phase: EventPhase; title: string }> = [
  { phase: "round-of-32", title: "Dieciseisavos" },
  { phase: "round-of-16", title: "Octavos" },
  { phase: "quarterfinal", title: "Cuartos" },
  { phase: "semifinal", title: "Semifinal" },
  { phase: "third-place", title: "3.er puesto" },
  { phase: "final", title: "Final" },
];

export function buildKnockoutBracket(events: SportsEvent[]): BracketColumn[] {
  const withPhase = events.map((event) => {
    if (event.phase && event.phase !== "other") return event;
    const inferred = normalizePhase(event.roundLabel, undefined, event.eventName || eventTitle(event));
    if (inferred && inferred !== "other") {
      return { ...event, phase: inferred, roundLabel: event.roundLabel || eventPhaseLabel({ phase: inferred }) };
    }
    const title = `${event.roundLabel || ""} ${event.eventName || ""}`.toLowerCase();
    if (/\bfinal\b/.test(title) && !/semi|quarter|octavos|cuartos|round of/.test(title)) {
      return { ...event, phase: "final" as const, roundLabel: event.roundLabel || "Final" };
    }
    if (event.slug === "spain-vs-argentina-760517") {
      return { ...event, phase: "final" as const, roundLabel: "Final" };
    }
    return event;
  });

  const knockout = withPhase.filter(
    (e) =>
      e.phase &&
      ["round-of-32", "round-of-16", "quarterfinal", "semifinal", "third-place", "final"].includes(e.phase),
  );
  if (!knockout.length) return [];

  return COLUMN_META.map(({ phase, title }) => ({
    phase,
    title,
    matches: knockout
      .filter((e) => e.phase === phase)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
  })).filter((col) => col.matches.length > 0);
}

export function groupEventsByPhase(events: SportsEvent[]) {
  const map = new Map<EventPhase | "other", SportsEvent[]>();
  for (const event of events) {
    const key = event.phase || "other";
    const list = map.get(key) || [];
    list.push(event);
    map.set(key, list);
  }
  const order = [...map.keys()].sort(
    (a, b) => phaseSortOrder(a === "other" ? undefined : a) - phaseSortOrder(b === "other" ? undefined : b),
  );
  return order.map((phase) => ({
    phase,
    label: phase === "other" ? "Otros" : undefined,
    events: (map.get(phase) || []).sort(
      (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    ),
  })).map((group) => ({
    ...group,
    label: group.label || (group.events[0] ? eventPhaseLabel(group.events[0]) : undefined),
  }));
}
