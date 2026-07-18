"use client";

import { useEffect } from "react";
import { readFavoriteIds, REMINDERS_KEY } from "@/lib/favorites";
import type { SportsEvent } from "@/lib/types";
import { eventTitle } from "@/lib/utils";

const NOTIFIED_KEY = "dj_notified_favorites";
const FIFTEEN_MINUTES = 15 * 60 * 1000;

export function FavoriteReminders() {
  useEffect(() => {
    let running = false;
    const check = async () => {
      if (
        running ||
        !("Notification" in window) ||
        Notification.permission !== "granted" ||
        localStorage.getItem(REMINDERS_KEY) !== "true"
      ) return;
      const favoriteIds = readFavoriteIds();
      if (!favoriteIds.length) return;
      running = true;
      try {
        const response = await fetch("/api/events", { cache: "no-store" });
        if (!response.ok) return;
        const body = (await response.json()) as { events?: SportsEvent[] };
        const notified = new Set<string>(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || "[]"));
        const now = Date.now();
        for (const event of body.events || []) {
          const remaining = new Date(event.startsAt).getTime() - now;
          if (!favoriteIds.includes(event.id) || event.status !== "upcoming" || remaining <= 0 || remaining > FIFTEEN_MINUTES || notified.has(event.id)) continue;
          const notification = new Notification(eventTitle(event), {
            body: `Comienza en menos de 15 minutos · ${event.league}`,
            icon: "/icon.png",
            tag: `match-${event.id}`,
          });
          notification.onclick = () => {
            window.focus();
            window.location.href = `/partido/${event.slug}`;
            notification.close();
          };
          notified.add(event.id);
        }
        localStorage.setItem(NOTIFIED_KEY, JSON.stringify(Array.from(notified).slice(-200)));
      } catch {
        // A failed reminder check should not affect the site.
      } finally {
        running = false;
      }
    };
    const initial = window.setTimeout(check, 4_000);
    const interval = window.setInterval(check, 60_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
