import type { StandingEntry } from "@/lib/types";
import { TeamLogo } from "./TeamLogo";

function metric(row: StandingEntry, ...keys: string[]) {
  return row.metrics?.find((m) => keys.some((k) => (m.key || m.label || "").toLowerCase().includes(k)))?.displayValue;
}

export function LeagueStandingsPanel({
  standings,
  title = "Clasificación",
  variant = "compact",
}: {
  standings: StandingEntry[];
  title?: string;
  variant?: "compact" | "full";
}) {
  if (!standings.length) return null;

  if (variant === "full") {
    return (
      <section className="panel league-standings-full">
        <h2>{title}</h2>
        <div className="league-standings-scroll">
          <table className="group-table league-table-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Equipo</th>
                <th>PJ</th>
                <th>G</th>
                <th>E</th>
                <th>P</th>
                <th>GF</th>
                <th>GC</th>
                <th>DG</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, index) => (
                <tr key={row.participant.slug}>
                  <td>{row.position || index + 1}</td>
                  <td>
                    <span className="inline-participant">
                      <TeamLogo name={row.participant.name} src={row.participant.logo} size={24} />
                      {row.participant.name}
                    </span>
                  </td>
                  <td>{metric(row, "gamesplayed", "played") ?? "—"}</td>
                  <td>{metric(row, "wins") ?? "—"}</td>
                  <td>{metric(row, "ties", "draws") ?? "—"}</td>
                  <td>{metric(row, "losses") ?? "—"}</td>
                  <td>{metric(row, "pointsfor", "goalsfor") ?? "—"}</td>
                  <td>{metric(row, "pointsagainst", "goalsagainst") ?? "—"}</td>
                  <td>{metric(row, "differential", "goaldifference") ?? "—"}</td>
                  <td><strong>{row.score ?? metric(row, "points") ?? "—"}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <div className="league-list standings-panel">
      <h3>{title}</h3>
      <ol className="standings-compact">
        {standings.slice(0, 20).map((row) => (
          <li key={row.participant.slug}>
            <span>{row.position ?? "—"}</span>
            <TeamLogo name={row.participant.name} src={row.participant.logo} size={24} />
            <strong>{row.participant.name}</strong>
            <b>{row.score ?? metric(row, "points") ?? ""}</b>
          </li>
        ))}
      </ol>
    </div>
  );
}
