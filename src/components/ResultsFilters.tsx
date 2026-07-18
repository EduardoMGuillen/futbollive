"use client";

import { useState } from "react";

type CatalogItem = {
  path: string;
  league: string;
  sport: string;
  sportSlug: string;
};

export function ResultsFilters({
  catalog,
  selectedSport,
  selectedTournament,
  selectedYear,
  currentYear,
}: {
  catalog: CatalogItem[];
  selectedSport: string;
  selectedTournament: string;
  selectedYear: number;
  currentYear: number;
}) {
  const [sport, setSport] = useState(selectedSport);
  const sports = Array.from(new Map(catalog.map((item) => [item.sportSlug, item.sport])).entries());
  const tournaments = catalog.filter((item) => item.sportSlug === sport);
  const tournamentValue = tournaments.some((item) => item.path === selectedTournament)
    ? selectedTournament
    : tournaments[0]?.path;

  return (
    <form className="results-filters" action="/resultados" method="get">
      <label>
        <span>Deporte</span>
        <select name="deporte" value={sport} onChange={(event) => setSport(event.target.value)}>
          {sports.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
        </select>
      </label>
      <label>
        <span>Torneo</span>
        <select key={sport} name="torneo" defaultValue={tournamentValue}>
          {tournaments.map((item) => <option key={item.path} value={item.path}>{item.league}</option>)}
        </select>
      </label>
      <label>
        <span>Año</span>
        <select name="anio" defaultValue={selectedYear}>
          {Array.from({ length: Math.min(15, currentYear - 1989) }, (_, index) => currentYear - index)
            .map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
      </label>
      <button type="submit">Ver resultados</button>
    </form>
  );
}
