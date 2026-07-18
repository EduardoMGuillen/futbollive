"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";

export function FavoriteButton({ eventId }: { eventId: string }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("dj_favorites") || "[]") as string[];
    queueMicrotask(() => setActive(saved.includes(eventId)));
  }, [eventId]);

  const toggle = () => {
    const saved = JSON.parse(localStorage.getItem("dj_favorites") || "[]") as string[];
    const next = active ? saved.filter((id) => id !== eventId) : [...new Set([...saved, eventId])];
    localStorage.setItem("dj_favorites", JSON.stringify(next));
    setActive(!active);
  };

  return (
    <button className={`favorite-btn ${active ? "is-active" : ""}`} onClick={toggle} aria-label="Guardar favorito">
      <Star size={17} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
