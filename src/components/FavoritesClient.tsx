"use client";

import { Bell, BellOff, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { FAVORITES_CHANGED, readFavoriteIds, REMINDERS_KEY } from "@/lib/favorites";
import type { SportsEvent } from "@/lib/types";
import { EventCard } from "./EventCard";

type PermissionState = NotificationPermission | "unsupported";

export function FavoritesClient() {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<PermissionState>("default");
  const [reminders, setReminders] = useState(false);

  useEffect(() => {
    const syncFavorites = () => setFavoriteIds(readFavoriteIds());
    const load = async () => {
      try {
        const response = await fetch("/api/events", { cache: "no-store" });
        const body = (await response.json()) as { events?: SportsEvent[] };
        setEvents(body.events || []);
      } finally {
        setLoading(false);
      }
    };
    queueMicrotask(() => {
      syncFavorites();
      setPermission("Notification" in window ? Notification.permission : "unsupported");
      setReminders(localStorage.getItem(REMINDERS_KEY) === "true");
    });
    void load();
    window.addEventListener(FAVORITES_CHANGED, syncFavorites);
    window.addEventListener("storage", syncFavorites);
    return () => {
      window.removeEventListener(FAVORITES_CHANGED, syncFavorites);
      window.removeEventListener("storage", syncFavorites);
    };
  }, []);

  const favoriteEvents = events
    .filter((event) => favoriteIds.includes(event.id))
    .sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    });

  const toggleReminders = async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    if (reminders) {
      localStorage.setItem(REMINDERS_KEY, "false");
      setReminders(false);
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      localStorage.setItem(REMINDERS_KEY, "true");
      setReminders(true);
    }
  };

  return (
    <>
      <div className="favorites-toolbar">
        <div>
          <strong>{favoriteEvents.length} favoritos próximos</strong>
          <small>Se guardan únicamente en este navegador.</small>
        </div>
        <button className={reminders ? "secondary-btn reminders-active" : "secondary-btn"} onClick={toggleReminders} type="button">
          {reminders ? <Bell size={17} /> : <BellOff size={17} />}
          {reminders ? "Recordatorios activos" : "Activar recordatorios"}
        </button>
      </div>
      {permission === "denied" && <p className="form-error">Las notificaciones están bloqueadas en el navegador. Puedes habilitarlas desde el candado de la barra de direcciones.</p>}
      {permission === "unsupported" && <p className="form-error">Este navegador no admite notificaciones.</p>}
      {reminders && <p className="favorites-note">Te avisaremos 15 minutos antes mientras Dónde Juega esté abierto en alguna pestaña.</p>}
      {loading ? (
        <div className="empty-state">Cargando tus favoritos…</div>
      ) : favoriteEvents.length ? (
        <div className="events-grid">{favoriteEvents.map((event) => <EventCard event={event} key={event.id} />)}</div>
      ) : (
        <div className="empty-state">
          <Star size={30} />
          <strong>Aún no tienes partidos favoritos</strong>
          <span>Usa la estrella de cualquier partido para guardarlo aquí.</span>
        </div>
      )}
    </>
  );
}
