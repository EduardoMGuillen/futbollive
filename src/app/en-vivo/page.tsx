import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { DayTimeline } from "@/components/DayTimeline";
import { EventCard } from "@/components/EventCard";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { isEventToday } from "@/lib/sport-today";
import { readStore } from "@/lib/store";
import { ensureFreshEvents, ensureLiveScores } from "@/lib/sync";
import { isPubliclyVisible } from "@/lib/utils";

/** Tope duro: sin esto /en-vivo generaba ~7MB HTML y AdSense marcaba el sitio como caído. */
const PAGE_SIZE = 36;

export const metadata: Metadata = {
  title: "Partidos en vivo hoy y agenda deportiva completa",
  description: "Consulta todos los partidos en vivo y próximos eventos por deporte, competición y estado, con horarios para Latinoamérica.",
  alternates: { canonical: "/en-vivo" },
  openGraph: { url: "/en-vivo", title: "Partidos en vivo hoy | Dónde Juega" },
};
export const dynamic = "force-dynamic";

function buildHref(params: { deporte?: string; estado?: string; vista?: string; page?: number }) {
  const q = new URLSearchParams();
  if (params.deporte) q.set("deporte", params.deporte);
  if (params.estado && params.estado !== "all") q.set("estado", params.estado);
  if (params.vista === "agenda") q.set("vista", "agenda");
  if (params.page && params.page > 1) q.set("page", String(params.page));
  const qs = q.toString();
  return qs ? `/en-vivo?${qs}` : "/en-vivo";
}

export default async function LivePage({
  searchParams,
}: {
  searchParams: Promise<{ deporte?: string; estado?: string; vista?: string; page?: string }>;
}) {
  const filters = await searchParams;
  await ensureFreshEvents();
  await ensureLiveScores();
  const data = await readStore();
  const visible = data.events.filter((event) => !event.hidden && isPubliclyVisible(event));
  const sports = Array.from(new Map(visible.map((event) => [event.sportSlug, event.sport])).entries());
  const selectedSport = filters.deporte;
  const selectedStatus = filters.estado === "live" || filters.estado === "upcoming" || filters.estado === "finished" ? filters.estado : "all";
  const agendaMode = filters.vista === "agenda";
  const page = Math.max(1, Math.min(50, Number.parseInt(filters.page || "1", 10) || 1));
  const events = visible
    .filter((event) => !selectedSport || event.sportSlug === selectedSport)
    .filter((event) => selectedStatus === "all" || event.status === selectedStatus)
    .sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      const timeA = new Date(a.startsAt).getTime();
      const timeB = new Date(b.startsAt).getTime();
      return a.status === "finished" ? timeB - timeA : timeA - timeB;
    });
  const total = events.length;
  const shown = events.slice(0, page * PAGE_SIZE);
  const hasMore = shown.length < total;
  const todayEvents = events.filter((e) => isEventToday(e.startsAt)).slice(0, 40);

  return (
    <>
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs">Inicio / Agenda deportiva</div>
        <h1>Todos los partidos</h1>
        <p>Explora la agenda por deporte y estado. Mostramos {shown.length} de {total} eventos{hasMore ? " — carga más abajo" : ""}.</p>
      </div></section>
      <div className="container content-section">
        <div className="sports-row">
          <Link className={!selectedSport ? "is-active" : ""} href={buildHref({ estado: selectedStatus, vista: agendaMode ? "agenda" : undefined })}>Todos</Link>
          {sports.map(([slug, name]) => (
            <Link
              className={selectedSport === slug ? "is-active" : ""}
              key={slug}
              href={buildHref({ deporte: slug, estado: selectedStatus, vista: agendaMode ? "agenda" : undefined })}
            >
              {name}
            </Link>
          ))}
        </div>
        <div className="filter-bar">
          {([["all", "Todos"], ["live", "En vivo"], ["upcoming", "Próximos"], ["finished", "Finalizados recientes"]] as const).map(([value, label]) => (
            <Link
              className={selectedStatus === value ? "active" : ""}
              key={value}
              href={buildHref({ deporte: selectedSport, estado: value, vista: agendaMode ? "agenda" : undefined })}
            >
              {label}
            </Link>
          ))}
        </div>
        <Suspense fallback={null}><ViewModeToggle /></Suspense>
        <div className="category-layout">
          <div>
            {shown.length ? (
              agendaMode ? <DayTimeline events={todayEvents.length ? todayEvents : shown.slice(0, 40)} /> : (
                <>
                  <div className="events-grid">{shown.map((event) => <EventCard event={event} key={event.id} />)}</div>
                  {hasMore && (
                    <p style={{ marginTop: 24, textAlign: "center" }}>
                      <Link
                        className="primary-btn"
                        href={buildHref({
                          deporte: selectedSport,
                          estado: selectedStatus,
                          vista: agendaMode ? "agenda" : undefined,
                          page: page + 1,
                        })}
                      >
                        Ver más partidos ({total - shown.length} restantes)
                      </Link>
                    </p>
                  )}
                </>
              )
            ) : <div className="empty-state">No hay eventos con estos filtros.</div>}
          </div>
          <aside className="sidebar">
            <AdSlot variant="box" banner={data.banners.find((banner) => banner.position === "sidebar")} />
            <div className="league-list"><h3>Competiciones</h3>
              {Array.from(new Map(visible.map((event) => [event.leagueSlug, event.league])).entries()).slice(0, 9).map(([slug, name]) => <Link href={`/liga/${slug}`} key={slug}>{name}<span>›</span></Link>)}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
