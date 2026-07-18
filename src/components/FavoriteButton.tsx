"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { FAVORITES_CHANGED, readFavoriteIds, writeFavoriteIds } from "@/lib/favorites";

export function FavoriteButton({ eventId }: { eventId: string }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const sync = () => setActive(readFavoriteIds().includes(eventId));
    queueMicrotask(sync);
    window.addEventListener(FAVORITES_CHANGED, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_CHANGED, sync);
      window.removeEventListener("storage", sync);
    };
  }, [eventId]);

  const toggle = () => {
    const saved = readFavoriteIds();
    const next = active ? saved.filter((id) => id !== eventId) : [...new Set([...saved, eventId])];
    writeFavoriteIds(next);
  };

  return (
    <button className={`favorite-btn ${active ? "is-active" : ""}`} onClick={toggle} aria-label="Guardar favorito">
      <Star size={17} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
