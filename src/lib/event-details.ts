import { fetchEspnEventDetails } from "./espn-details";
import { fetchPandaScoreEventDetails } from "./pandascore";
import type { EventDetails, SportsEvent } from "./types";

/** Despacha la consulta de detalles al proveedor correcto según la fuente del evento. */
export function fetchEventDetails(event: SportsEvent): Promise<EventDetails> {
  if (event.source === "pandascore") return fetchPandaScoreEventDetails(event);
  return fetchEspnEventDetails(event);
}
