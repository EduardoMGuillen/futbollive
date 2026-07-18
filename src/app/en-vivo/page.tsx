import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { EventCard } from "@/components/EventCard";
import { readStore } from "@/lib/store";

export const metadata: Metadata = {
  title: "Partidos en vivo hoy y agenda deportiva completa",
  description: "Consulta todos los partidos en vivo y próximos eventos por deporte, competición y estado, con horarios para Latinoamérica.",
  alternates: { canonical: "/en-vivo" },
  openGraph: { url: "/en-vivo", title: "Partidos en vivo hoy | Dónde Juega" },
};
export const dynamic = "force-dynamic";

export default async function LivePage({
  searchParams,
}: {
  searchParams: Promise<{ deporte?: string; estado?: string }>;
}) {
  const filters = await searchParams;
  const data = await readStore();
  const visible = data.events.filter((event) => !event.hidden);
  const sports = Array.from(new Map(visible.map((event) => [event.sportSlug, event.sport])).entries());
  const selectedSport = filters.deporte;
  const selectedStatus = filters.estado || "all";
  const events = visible
    .filter((event) => !selectedSport || event.sportSlug === selectedSport)
    .filter((event) => selectedStatus === "all" || event.status === selectedStatus)
    .sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    });

  return (
    <>
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs">Inicio / Agenda deportiva</div>
        <h1>Todos los partidos</h1>
        <p>Explora la agenda completa por deporte y estado. La portada solo muestra los eventos más relevantes; aquí puedes verlo todo.</p>
      </div></section>
      <div className="container content-section">
        <div className="sports-row">
          <Link className={!selectedSport ? "is-active" : ""} href={`/en-vivo?estado=${selectedStatus}`}>Todos</Link>
          {sports.map(([slug, name]) => <Link className={selectedSport === slug ? "is-active" : ""} key={slug} href={`/en-vivo?deporte=${slug}&estado=${selectedStatus}`}>{name}</Link>)}
        </div>
        <div className="filter-bar">
          {[["all", "Todos"], ["live", "En vivo"], ["upcoming", "Próximos"], ["finished", "Finalizados"]].map(([value, label]) => (
            <Link className={selectedStatus === value ? "active" : ""} key={value} href={`/en-vivo?${selectedSport ? `deporte=${selectedSport}&` : ""}estado=${value}`}>{label}</Link>
          ))}
        </div>
        <div className="category-layout">
          <div>
            {events.length ? <div className="events-grid">{events.map((event) => <EventCard event={event} key={event.id} />)}</div> : <div className="empty-state">No hay eventos con estos filtros.</div>}
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
