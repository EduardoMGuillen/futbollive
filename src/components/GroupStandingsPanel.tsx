import { TeamLogo } from "@/components/TeamLogo";
import type { StandingEntry } from "@/lib/types";

export type StandingsGroup = {
  name: string;
  entries: StandingEntry[];
};

function metric(row: StandingEntry, ...keys: string[]) {
  return row.metrics?.find((m) => keys.some((k) => (m.key || m.label || "").toLowerCase().includes(k)))?.displayValue;
}

function localizeGroupName(name: string) {
  return name
    .replace(/^Group\s+/i, "Grupo ")
    .replace(/^Grupo\s+Group\s+/i, "Grupo ");
}

export function GroupStandingsPanel({
  groups,
  title = "Fase de grupos",
}: {
  groups: StandingsGroup[];
  title?: string;
}) {
  if (!groups.length) return null;
  const sorted = [...groups].sort((a, b) => localizeGroupName(a.name).localeCompare(localizeGroupName(b.name), "es"));
  return (
    <section className="panel group-standings">
      <h2>{title}</h2>
      <p className="group-standings-lead">Posiciones y puntos finales de cada grupo.</p>
      <div className="group-standings-grid">
        {sorted.map((group) => (
          <div className="group-standings-card" key={group.name}>
            <h3>{localizeGroupName(group.name)}</h3>
            <table className="group-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Equipo</th>
                  <th>PJ</th>
                  <th>G</th>
                  <th>E</th>
                  <th>P</th>
                  <th>DG</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {group.entries.map((row, index) => (
                  <tr key={row.participant.slug}>
                    <td>{row.position || index + 1}</td>
                    <td>
                      <span className="inline-participant">
                        <TeamLogo name={row.participant.name} src={row.participant.logo} size={22} />
                        {row.participant.name}
                      </span>
                    </td>
                    <td>{metric(row, "gamesplayed", "played") ?? "—"}</td>
                    <td>{metric(row, "wins") ?? "—"}</td>
                    <td>{metric(row, "ties", "draws") ?? "—"}</td>
                    <td>{metric(row, "losses") ?? "—"}</td>
                    <td>{metric(row, "differential", "goaldifference") ?? "—"}</td>
                    <td><strong>{row.score ?? metric(row, "points") ?? "—"}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </section>
  );
}
