import Link from "next/link";
import type { SportsEvent } from "@/lib/types";
import { TeamLogo } from "./TeamLogo";

export function TournamentBracket({ columns }: { columns: Array<{ title: string; matches: SportsEvent[] }> }) {
  if (!columns.length) return null;
  return (
    <section className="bracket-section panel">
      <h2>Cuadro eliminatorio</h2>
      <div className="bracket-grid">
        {columns.map((column) => (
          <div className="bracket-column" key={column.title}>
            <h3>{column.title}</h3>
            <div className="bracket-matches">
              {column.matches.map((match) => (
                <Link href={`/partido/${match.slug}`} className="bracket-match" key={match.id}>
                  <span className="bracket-team">
                    <TeamLogo name={match.home.name} src={match.home.logo} size={22} />
                    <strong>{match.home.name}</strong>
                    {match.status !== "upcoming" && <b>{match.home.score ?? 0}</b>}
                  </span>
                  <span className="bracket-team">
                    <TeamLogo name={match.away.name} src={match.away.logo} size={22} />
                    <strong>{match.away.name}</strong>
                    {match.status !== "upcoming" && <b>{match.away.score ?? 0}</b>}
                  </span>
                  {match.roundLabel && <small>{match.roundLabel}</small>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
