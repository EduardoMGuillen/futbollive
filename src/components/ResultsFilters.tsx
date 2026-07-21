"use client";

import { useState } from "react";
import { SearchableSelect } from "./SearchableSelect";

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
  searchQuery = "",
}: {
  catalog: CatalogItem[];
  selectedSport: string;
  selectedTournament: string;
  selectedYear: number;
  currentYear: number;
  searchQuery?: string;
}) {
  const [sport, setSport] = useState(selectedSport);
  const sports = Array.from(new Map(catalog.map((item) => [item.sportSlug, item.sport])).entries());
  const tournaments = catalog.filter((item) => item.sportSlug === sport);
  const tournamentValue = tournaments.some((item) => item.path === selectedTournament)
    ? selectedTournament
    : tournaments[0]?.path;

  const tournamentOptions = tournaments.map((item) => ({ value: item.path, label: item.league }));

  return (
    <form className="results-filters" action="/resultados" method="get">
      <label>
        <span>Deporte</span>
        <select name="deporte" value={sport} onChange={(event) => setSport(event.target.value)}>
          {sports.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
        </select>
      </label>
      <label className="results-tournament-field">
        <span>Torneo</span>
        <SearchableSelect
          key={sport}
          name="torneo"
          options={tournamentOptions}
          value={tournamentValue || ""}
          placeholder="Escribe para buscar torneo…"
          required
        />
      </label>
      <label>
        <span>Año</span>
        <select name="anio" defaultValue={selectedYear}>
          {Array.from({ length: Math.min(15, currentYear - 1989) }, (_, index) => currentYear - index)
            .map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
      </label>
      <label className="results-search-field">
        <span>Buscar partido</span>
        <input type="search" name="q" defaultValue={searchQuery} placeholder="Equipo, rival, fase…" />
      </label>
      <button type="submit">Ver resultados</button>
    </form>
  );
}
