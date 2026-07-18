import { Search } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { listEvents } from "@/lib/store";

export const metadata = {
  title: "Buscar partidos, equipos y competiciones",
  description: "Busca partidos, equipos, selecciones, deportes y competiciones en Dónde Juega.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const found = q ? await listEvents({ query: q }) : [];
  const statusOrder = { live: 0, upcoming: 1, finished: 2 } as const;
  const events = [...found].sort((a, b) => {
    const byStatus = statusOrder[a.status] - statusOrder[b.status];
    if (byStatus !== 0) return byStatus;
    // Upcoming: soonest first. Finished: most recent first.
    const timeA = new Date(a.startsAt).getTime();
    const timeB = new Date(b.startsAt).getTime();
    return a.status === "finished" ? timeB - timeA : timeA - timeB;
  });
  return (
    <>
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs">Inicio / Buscar</div>
        <h1>Encuentra tu partido</h1>
        <p>Busca por equipo, selección, liga o deporte.</p>
      </div></section>
      <section className="container content-section">
        <form action="/buscar" className="search-input-row panel">
          <Search size={20} /><input name="q" defaultValue={q} placeholder="Real Madrid, NBA, Champions..." autoFocus /><button className="primary-btn" type="submit">Buscar</button>
        </form>
        <div className="section-head" style={{ marginTop: 34 }}><div><h2>{q ? `Resultados para “${q}”` : "Empieza una búsqueda"}</h2><p>{events.length} partidos encontrados</p></div></div>
        {events.length ? <div className="events-grid">{events.map((event) => <EventCard event={event} key={event.id} />)}</div> : q ? <div className="empty-state">No encontramos partidos relacionados.</div> : null}
      </section>
    </>
  );
}
