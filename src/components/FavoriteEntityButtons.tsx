"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import {
  FAVORITES_CHANGED,
  isFavoriteLeague,
  isFavoriteTeam,
  toggleFavoriteLeague,
  toggleFavoriteTeam,
  type FavoriteLeague,
  type FavoriteTeam,
} from "@/lib/favorites";

export function FavoriteLeagueButton({ league }: { league: FavoriteLeague }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const sync = () => setActive(isFavoriteLeague(league.slug));
    queueMicrotask(sync);
    window.addEventListener(FAVORITES_CHANGED, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_CHANGED, sync);
      window.removeEventListener("storage", sync);
    };
  }, [league.slug]);

  return (
    <button
      type="button"
      className={`secondary-btn favorite-entity-btn ${active ? "is-active" : ""}`}
      onClick={() => setActive(toggleFavoriteLeague(league))}
      aria-pressed={active}
      aria-label={active ? `Quitar ${league.name} de favoritos` : `Guardar ${league.name} en favoritos`}
    >
      <Star size={16} fill={active ? "currentColor" : "none"} />
      {active ? "Liga guardada" : "Guardar liga"}
    </button>
  );
}

export function FavoriteTeamButton({ team }: { team: FavoriteTeam }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const sync = () => setActive(isFavoriteTeam(team.slug));
    queueMicrotask(sync);
    window.addEventListener(FAVORITES_CHANGED, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_CHANGED, sync);
      window.removeEventListener("storage", sync);
    };
  }, [team.slug]);

  return (
    <button
      type="button"
      className={`secondary-btn favorite-entity-btn ${active ? "is-active" : ""}`}
      onClick={() => setActive(toggleFavoriteTeam(team))}
      aria-pressed={active}
      aria-label={active ? `Quitar ${team.name} de favoritos` : `Guardar ${team.name} en favoritos`}
    >
      <Star size={16} fill={active ? "currentColor" : "none"} />
      {active ? "Equipo guardado" : "Guardar equipo"}
    </button>
  );
}
