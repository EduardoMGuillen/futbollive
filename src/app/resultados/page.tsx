import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { ResultsFilters } from "@/components/ResultsFilters";
import { fetchEspnResults, getEspnLeagueCatalog } from "@/lib/espn";

export const metadata: Metadata = {
  title: "Resultados deportivos por torneo y año",
  description: "Consulta resultados anteriores de fútbol, baloncesto, béisbol, tenis, Fórmula 1, UFC y más deportes.",
  alternates: { canonical: "/resultados" },
};
export const dynamic = "force-dynamic";

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ deporte?: string; torneo?: string; anio?: string; pagina?: string }>;
}) {
  const filters = await searchParams;
  const catalog = getEspnLeagueCatalog();
  const sportNames = Array.from(new Map(catalog.map((item) => [item.sportSlug, item.sport])).entries());
  const selectedSport = sportNames.some(([slug]) => slug === filters.deporte) ? filters.deporte! : "futbol";
  const tournaments = catalog.filter((item) => item.sportSlug === selectedSport);
  const requestedTournament = filters.torneo;
  const defaultTournament = selectedSport === "futbol"
    ? tournaments.find((item) => item.path === "soccer/fifa.world")
    : tournaments[0];
  const selectedTournament = tournaments.some((item) => item.path === requestedTournament)
    ? requestedTournament!
    : defaultTournament?.path || "";
  const currentYear = new Date().getUTCFullYear();
  const parsedYear = Number(filters.anio);
  const selectedYear = Number.isInteger(parsedYear) && parsedYear >= 1990 && parsedYear <= currentYear
    ? parsedYear
    : currentYear;
  const allEvents = selectedTournament ? await fetchEspnResults(selectedTournament, selectedYear) : [];
  const pageSize = 48;
  const totalPages = Math.max(1, Math.ceil(allEvents.length / pageSize));
  const parsedPage = Number(filters.pagina);
  const selectedPage = Number.isInteger(parsedPage) && parsedPage >= 1 && parsedPage <= totalPages ? parsedPage : 1;
  const events = allEvents.slice((selectedPage - 1) * pageSize, selectedPage * pageSize);
  const pageHref = (page: number) => `/resultados?deporte=${encodeURIComponent(selectedSport)}&torneo=${encodeURIComponent(selectedTournament)}&anio=${selectedYear}&pagina=${page}`;

  return (
    <>
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><Link href="/">Inicio</Link> / Resultados</div>
        <h1>Resultados deportivos</h1>
        <p>Consulta marcadores y clasificaciones anteriores directamente desde ESPN, por deporte, torneo y año.</p>
      </div></section>
      <main className="container content-section">
        <ResultsFilters
          catalog={catalog}
          selectedSport={selectedSport}
          selectedTournament={selectedTournament}
          selectedYear={selectedYear}
          currentYear={currentYear}
        />
        <div className="section-head">
          <div>
            <span className="eyebrow">ARCHIVO ESPN</span>
            <h2>{tournaments.find((item) => item.path === selectedTournament)?.league} · {selectedYear}</h2>
          </div>
          <p>{allEvents.length} eventos finalizados</p>
        </div>
        {events.length
          ? <div className="events-grid">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>
          : <div className="empty-state">No se encontraron resultados para estos filtros.</div>}
        {totalPages > 1 && <nav className="results-pagination" aria-label="Paginación de resultados">
          {selectedPage > 1 && <Link href={pageHref(selectedPage - 1)}>← Anterior</Link>}
          <span>Página {selectedPage} de {totalPages}</span>
          {selectedPage < totalPages && <Link href={pageHref(selectedPage + 1)}>Siguiente →</Link>}
        </nav>}
      </main>
    </>
  );
}
