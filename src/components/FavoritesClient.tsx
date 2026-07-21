"use client";

import { Bell, BellOff, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FAVORITES_CHANGED,
  readFavoriteIds,
  readFavoriteLeagues,
  readFavoriteTeams,
  REMINDERS_KEY,
  type FavoriteLeague,
  type FavoriteTeam,
} from "@/lib/favorites";
import type { SportsEvent } from "@/lib/types";
import { EventCard } from "./EventCard";
import { TeamLogo } from "./TeamLogo";

type PermissionState = NotificationPermission | "unsupported";
type Tab = "agenda" | "partidos" | "ligas" | "equipos";

export function FavoritesClient() {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [leagues, setLeagues] = useState<FavoriteLeague[]>([]);
  const [teams, setTeams] = useState<FavoriteTeam[]>([]);
  const [tab, setTab] = useState<Tab>("agenda");
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<PermissionState>("default");
  const [reminders, setReminders] = useState(false);

  useEffect(() => {
    const syncFavorites = () => {
      setFavoriteIds(readFavoriteIds());
      setLeagues(readFavoriteLeagues());
      setTeams(readFavoriteTeams());
    };
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

  const favoriteEvents = useMemo(
    () =>
      events
        .filter((event) => favoriteIds.includes(event.id))
        .sort((a, b) => {
          if (a.status === "live" && b.status !== "live") return -1;
          if (b.status === "live" && a.status !== "live") return 1;
          return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
        }),
    [events, favoriteIds],
  );

  const leagueSlugs = useMemo(() => new Set(leagues.map((l) => l.slug)), [leagues]);
  const teamSlugs = useMemo(() => new Set(teams.map((t) => t.slug)), [teams]);

  const myAgenda = useMemo(() => {
    return events
      .filter((event) => {
        if (favoriteIds.includes(event.id)) return true;
        if (leagueSlugs.has(event.leagueSlug)) return true;
        if (teamSlugs.has(event.home.slug) || teamSlugs.has(event.away.slug)) return true;
        if (event.participants?.some((p) => teamSlugs.has(p.slug))) return true;
        return false;
      })
      .sort((a, b) => {
        if (a.status === "live" && b.status !== "live") return -1;
        if (b.status === "live" && a.status !== "live") return 1;
        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      });
  }, [events, favoriteIds, leagueSlugs, teamSlugs]);

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
          <strong>Mis favoritos</strong>
          <small>Partidos, ligas y equipos se guardan solo en este navegador.</small>
        </div>
        <button className={reminders ? "secondary-btn reminders-active" : "secondary-btn"} onClick={toggleReminders} type="button">
          {reminders ? <Bell size={17} /> : <BellOff size={17} />}
          {reminders ? "Recordatorios activos" : "Activar recordatorios"}
        </button>
      </div>
      <div className="filter-bar favorites-tabs">
        {(
          [
            ["agenda", `Mi agenda (${myAgenda.length})`],
            ["partidos", `Partidos (${favoriteEvents.length})`],
            ["ligas", `Ligas (${leagues.length})`],
            ["equipos", `Equipos (${teams.length})`],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {permission === "denied" && <p className="form-error">Las notificaciones están bloqueadas en el navegador.</p>}
      {permission === "unsupported" && <p className="form-error">Este navegador no admite notificaciones.</p>}
      {reminders && <p className="favorites-note">Te avisaremos 15 minutos antes mientras Dónde Juega esté abierto.</p>}

      {loading ? (
        <div className="empty-state">Cargando tus favoritos…</div>
      ) : tab === "ligas" ? (
        leagues.length ? (
          <div className="fav-entity-grid">
            {leagues.map((league) => (
              <Link key={league.slug} href={`/liga/${league.slug}`} className="fav-entity-card">
                <strong>{league.name}</strong>
                <span>Ver calendario ›</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Star size={30} />
            <strong>Sin ligas guardadas</strong>
            <span>En cualquier landing de liga usa “Guardar liga”.</span>
          </div>
        )
      ) : tab === "equipos" ? (
        teams.length ? (
          <div className="fav-entity-grid">
            {teams.map((team) => (
              <Link key={team.slug} href={team.href} className="fav-entity-card">
                <span className="inline-participant">
                  <TeamLogo name={team.name} src={team.logo} size={36} />
                  <strong>{team.name}</strong>
                </span>
                <span>Ver agenda ›</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Star size={30} />
            <strong>Sin equipos guardados</strong>
            <span>En la página de un equipo usa “Guardar equipo”.</span>
          </div>
        )
      ) : tab === "partidos" ? (
        favoriteEvents.length ? (
          <div className="events-grid">{favoriteEvents.map((event) => <EventCard event={event} key={event.id} />)}</div>
        ) : (
          <div className="empty-state">
            <Star size={30} />
            <strong>Aún no tienes partidos favoritos</strong>
            <span>Usa la estrella de cualquier partido para guardarlo aquí.</span>
          </div>
        )
      ) : myAgenda.length ? (
        <div className="events-grid">{myAgenda.map((event) => <EventCard event={event} key={event.id} />)}</div>
      ) : (
        <div className="empty-state">
          <Star size={30} />
          <strong>Tu agenda está vacía</strong>
          <span>Guarda partidos, ligas o equipos para armar “Mi agenda”.</span>
        </div>
      )}
    </>
  );
}
