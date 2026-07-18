import type { EventDetails, SportsEvent } from "./types";

export const sportIcons: Record<string, string> = {
  futbol: "⚽",
  baloncesto: "🏀",
  beisbol: "⚾",
  tenis: "🎾",
  automovilismo: "🏎",
  hockey: "🏒",
  "futbol-americano": "🏈",
  mma: "🥊",
  voleibol: "🏐",
  golf: "⛳",
  rugby: "🏉",
  cricket: "🏏",
  lacrosse: "🥍",
  "futbol-australiano": "🦵",
};

export function sportIcon(slug: string) {
  return sportIcons[slug] || "🏆";
}

const INDIVIDUAL_SPORTS = new Set([
  "tenis",
  "mma",
  "automovilismo",
  "golf",
]);

export function isIndividualSport(event: Pick<SportsEvent, "sportSlug" | "format">) {
  return event.format === "multi" || INDIVIDUAL_SPORTS.has(event.sportSlug);
}

export function participantEntityPath(event: Pick<SportsEvent, "sportSlug" | "format">) {
  return isIndividualSport(event) ? "atleta" : "equipo";
}

export function sportFamily(event: Pick<SportsEvent, "sportSlug" | "format" | "sourceLeaguePath">): EventDetails["family"] {
  if (event.sportSlug === "tenis" || event.sourceLeaguePath?.startsWith("tennis/")) return "tennis";
  if (event.sportSlug === "mma" || event.sourceLeaguePath?.startsWith("mma/")) return "combat";
  if (event.sportSlug === "automovilismo" || event.sourceLeaguePath?.startsWith("racing/")) return "racing";
  if (event.sportSlug === "golf" || event.sourceLeaguePath?.startsWith("golf/")) return "golf";
  if (event.format === "multi") return "generic";
  return "team";
}

export function sportLabels(event: Pick<SportsEvent, "sportSlug" | "format">): EventDetails["labels"] {
  const individual = isIndividualSport(event);
  switch (event.sportSlug) {
    case "tenis":
      return {
        participantHref: "atleta",
        rosterTitle: "Jugadores",
        segmentTitle: "Sets",
        statsTitle: "Estadísticas del partido",
        leadersTitle: "Líderes",
        whenLabel: "¿Cuándo juegan?",
        whereLabel: "¿Dónde se juega?",
      };
    case "mma":
      return {
        participantHref: "atleta",
        rosterTitle: "Peleadores",
        contestsTitle: "Cartelera",
        statsTitle: "Estadísticas",
        whenLabel: "¿Cuándo pelean?",
        whereLabel: "¿Dónde se realiza?",
      };
    case "automovilismo":
      return {
        participantHref: "atleta",
        rosterTitle: "Pilotos",
        standingsTitle: "Clasificación",
        statsTitle: "Estadísticas",
        whenLabel: "¿Cuándo corre?",
        whereLabel: "¿Dónde se disputa?",
      };
    case "golf":
      return {
        participantHref: "atleta",
        rosterTitle: "Golfistas",
        standingsTitle: "Leaderboard",
        statsTitle: "Estadísticas",
        whenLabel: "¿Cuándo teean?",
        whereLabel: "¿Dónde se juega?",
      };
    case "beisbol":
      return {
        participantHref: "equipo",
        rosterTitle: "Alineaciones",
        segmentTitle: "Entradas",
        statsTitle: "Estadísticas del partido",
        leadersTitle: "Líderes",
        whenLabel: "¿Cuándo juegan?",
        whereLabel: "¿Dónde se juega?",
      };
    case "baloncesto":
      return {
        participantHref: "equipo",
        rosterTitle: "Alineaciones",
        segmentTitle: "Cuartos",
        statsTitle: "Estadísticas del partido",
        leadersTitle: "Líderes",
        whenLabel: "¿Cuándo juegan?",
        whereLabel: "¿Dónde se juega?",
      };
    case "futbol-americano":
      return {
        participantHref: "equipo",
        rosterTitle: "Alineaciones",
        segmentTitle: "Cuartos",
        statsTitle: "Estadísticas del partido",
        leadersTitle: "Líderes",
        whenLabel: "¿Cuándo juegan?",
        whereLabel: "¿Dónde se juega?",
      };
    case "hockey":
      return {
        participantHref: "equipo",
        rosterTitle: "Alineaciones",
        segmentTitle: "Periodos",
        statsTitle: "Estadísticas del partido",
        leadersTitle: "Líderes",
        whenLabel: "¿Cuándo juegan?",
        whereLabel: "¿Dónde se juega?",
      };
    case "cricket":
      return {
        participantHref: "equipo",
        rosterTitle: "Equipos",
        segmentTitle: "Innings",
        statsTitle: "Estadísticas del partido",
        leadersTitle: "Líderes",
        whenLabel: "¿Cuándo juegan?",
        whereLabel: "¿Dónde se juega?",
      };
    default:
      return {
        participantHref: individual ? "atleta" : "equipo",
        rosterTitle: individual ? "Participantes" : "Alineaciones",
        segmentTitle: individual ? undefined : "Parciales",
        statsTitle: "Estadísticas",
        leadersTitle: "Líderes",
        standingsTitle: individual ? "Clasificación" : undefined,
        whenLabel: "¿Cuándo es?",
        whereLabel: "¿Dónde se realiza?",
      };
  }
}
