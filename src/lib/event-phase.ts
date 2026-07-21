import type { SportsEvent } from "./types";

export type EventPhase =
  | "groups"
  | "league"
  | "round-of-32"
  | "round-of-16"
  | "quarterfinal"
  | "semifinal"
  | "third-place"
  | "final"
  | "other";

const stripAccents = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Etiqueta en español a partir de round/type/altGameNote de ESPN. */
export function roundLabelFromEspn(roundDisplay?: string, typeText?: string, eventName?: string): string | undefined {
  const raw = [roundDisplay, typeText, eventName].filter(Boolean).join(" · ");
  if (!raw.trim()) return undefined;
  const n = stripAccents(raw);

  if (/group stage|fase de grupos/.test(n) || (/\bgroup\b|\bgrupo\b/.test(n) && !/round of/.test(n))) {
    const groupLetter = raw.match(/group\s*([a-l0-9]+)/i) || raw.match(/grupo\s*([a-l0-9]+)/i);
    if (groupLetter) return `Grupo ${groupLetter[1].toUpperCase()}`;
    return "Fase de grupos";
  }
  if (/round of 32|round of thirty|dieciseisavos|last 32/.test(n)) return "Dieciseisavos de final";
  if (/round of 16|octavos|round of sixteen|last 16/.test(n)) return "Octavos de final";
  if (/quarter|cuartos/.test(n)) return "Cuartos de final";
  if (/semi|semifinal/.test(n)) return "Semifinal";
  if (/3rd|third|tercer/.test(n)) return "Tercer puesto";
  if (/\bfinal\b/.test(n) && !/semi|quarter|round of|octavos|cuartos/.test(n)) return "Final";
  if (/regular season|liga regular|matchday|jornada|week \d|regular/.test(n)) {
    const week = raw.match(/week\s*(\d+)/i) || raw.match(/jornada\s*(\d+)/i);
    if (week) return `Jornada ${week[1]}`;
    return typeText || roundDisplay || undefined;
  }
  if (/playoff|eliminatoria|knockout/.test(n)) return roundDisplay || typeText || "Eliminatorias";

  // Si el texto es "FIFA World Cup, Final" ya se capturó; si queda "Tournament, Round X" usa el tramo tras la coma.
  const afterComma = raw.split(",").map((s) => s.trim()).pop();
  if (afterComma && afterComma !== raw && afterComma.length < 40) {
    const nested: string | undefined = roundLabelFromEspn(afterComma, undefined, undefined);
    if (nested) return nested;
  }

  return roundDisplay || typeText || undefined;
}

export function normalizePhase(
  roundDisplay?: string,
  typeText?: string,
  eventName?: string,
): EventPhase | undefined {
  const label = roundLabelFromEspn(roundDisplay, typeText, eventName);
  if (!label) return undefined;
  const n = stripAccents(label);

  if (n.includes("grupo") || n.includes("fase de grupos")) return "groups";
  if (n.includes("jornada") || n.includes("liga regular")) return "league";
  if (n.includes("dieciseisavos")) return "round-of-32";
  if (n.includes("octavos")) return "round-of-16";
  if (n.includes("cuartos")) return "quarterfinal";
  if (n.includes("semifinal")) return "semifinal";
  if (n.includes("tercer")) return "third-place";
  if (n === "final") return "final";
  return "other";
}

export function phaseSortOrder(phase?: EventPhase) {
  const order: Record<EventPhase, number> = {
    groups: 0,
    league: 1,
    "round-of-32": 2,
    "round-of-16": 3,
    quarterfinal: 4,
    semifinal: 5,
    "third-place": 6,
    final: 7,
    other: 8,
  };
  return phase ? order[phase] : 99;
}

function phaseOnlyLabel(phase: EventPhase): string | undefined {
  switch (phase) {
    case "groups":
      return "Fase de grupos";
    case "league":
      return "Liga regular";
    case "round-of-32":
      return "Dieciseisavos de final";
    case "round-of-16":
      return "Octavos de final";
    case "quarterfinal":
      return "Cuartos de final";
    case "semifinal":
      return "Semifinal";
    case "third-place":
      return "Tercer puesto";
    case "final":
      return "Final";
    default:
      return undefined;
  }
}

export function eventPhaseLabel(event: Pick<SportsEvent, "roundLabel" | "phase" | "eventName">): string | undefined {
  if (event.roundLabel) {
    const translated = roundLabelFromEspn(event.roundLabel, event.eventName);
    if (translated && translated !== event.roundLabel) return translated;
    if (/^(1st leg|2nd leg|makeup|doubleheader)/i.test(event.roundLabel)) {
      return event.phase && event.phase !== "other" ? phaseOnlyLabel(event.phase) : undefined;
    }
    return event.roundLabel;
  }
  if (event.phase) return phaseOnlyLabel(event.phase);
  return roundLabelFromEspn(undefined, undefined, event.eventName);
}

/** Resuelve etiqueta de fase para UI aunque el store aún no tenga roundLabel. */
export function resolveDisplayPhase(event: Pick<SportsEvent, "roundLabel" | "phase" | "eventName" | "league" | "leagueSlug" | "slug">): string | undefined {
  const direct = eventPhaseLabel(event);
  if (direct) return direct;
  const fromName = roundLabelFromEspn(undefined, undefined, event.eventName || event.league);
  if (fromName) return fromName;
  if (event.slug === "spain-vs-argentina-760517" || event.slug?.includes("760517")) return "Final";
  return undefined;
}

export function eventMatchesQuery(event: SportsEvent, query: string) {
  const q = stripAccents(query.trim());
  if (!q) return true;
  const parts = [
    event.home.name,
    event.away.name,
    event.eventName,
    event.league,
    event.roundLabel,
    resolveDisplayPhase(event),
    event.slug,
  ];
  return parts.some((part) => part && stripAccents(part).includes(q));
}
