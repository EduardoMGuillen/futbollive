import type { EventDetails, SportsEvent } from "@/lib/types";
import { participantHref } from "@/lib/sports";
import { TeamLogo } from "@/components/TeamLogo";
import Link from "next/link";

export function SegmentScoreboard({ details }: { details: EventDetails }) {
  if (!details.segments?.length) return null;
  return (
    <section className="panel detail-section">
      <h2>{details.labels.segmentTitle || "Parciales"}</h2>
      <div className="segment-table-wrap">
        <table className="segment-table">
          <thead>
            <tr>
              <th>Participante</th>
              {details.segments.map((segment) => <th key={segment.key}>{segment.label}</th>)}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {details.participants.map((participant) => (
              <tr key={participant.id}>
                <td>
                  <span className="inline-participant">
                    <TeamLogo name={participant.name} src={participant.logo} size={24} />
                    {participant.shortName || participant.name}
                  </span>
                </td>
                {details.segments!.map((segment) => {
                  const score = segment.scores.find((item) => item.participantId === participant.id);
                  return <td key={`${participant.id}-${segment.key}`}>{score?.value ?? "–"}</td>;
                })}
                <td><strong>{participant.score ?? "–"}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function StatsPanels({ details }: { details: EventDetails }) {
  if (!details.statisticGroups?.length) return null;
  return (
    <section className="panel detail-section">
      <h2>{details.labels.statsTitle || "Estadísticas"}</h2>
      <div className="stats-grid">
        {details.statisticGroups.slice(0, 8).map((group) => (
          <div key={group.key} className="stats-card">
            <h3>{group.label}</h3>
            <ul className="stat-list">
              {group.statistics.slice(0, 16).map((stat) => (
                <li key={`${group.key}-${stat.key}`}>
                  <span>{stat.label}</span>
                  <strong>{stat.displayValue}</strong>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LeadersPanel({ details }: { details: EventDetails }) {
  if (!details.leaders?.length) return null;
  return (
    <section className="panel detail-section">
      <h2>{details.labels.leadersTitle || "Líderes"}</h2>
      <div className="stats-grid">
        {details.leaders.slice(0, 6).map((group) => (
          <div key={group.key} className="stats-card">
            <h3>{group.label}</h3>
            <ul className="stat-list">
              {group.statistics.slice(0, 5).map((stat) => (
                <li key={`${group.key}-${stat.key}`}>
                  <span>{stat.rank ? `${stat.rank}. ` : ""}{stat.label}</span>
                  <strong>{stat.displayValue}</strong>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StandingsPanel({ details }: { details: EventDetails }) {
  if (!details.standings?.length) return null;
  return (
    <section className="panel detail-section">
      <h2>{details.labels.standingsTitle || "Clasificación"}</h2>
      <ol className="detail-leaderboard">
        {details.standings.slice(0, 30).map((entry, index) => (
          <li key={`${entry.participant.id}-${index}`}>
            <span>{entry.position || index + 1}</span>
            <TeamLogo name={entry.participant.name} src={entry.participant.logo} size={36} />
            <div className="standing-meta">
              <strong>{entry.participant.name}</strong>
              {entry.metrics?.length ? (
                <small>{entry.metrics.slice(0, 3).map((metric) => `${metric.label}: ${metric.displayValue}`).join(" · ")}</small>
              ) : null}
            </div>
            {entry.score !== undefined && <b>{entry.score}</b>}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ContestsPanel({ details }: { details: EventDetails }) {
  if (!details.contests?.length) return null;
  return (
    <section className="panel detail-section">
      <h2>{details.labels.contestsTitle || "Cartelera"}</h2>
      <div className="contests-list">
        {details.contests.map((contest) => (
          <article key={contest.id} className="contest-card">
            <header>
              <strong>{contest.label || contest.weightClass || "Combate"}</strong>
              {contest.status && <span>{contest.status}</span>}
            </header>
            <div className="contest-fighters">
              {contest.participants.map((participant) => (
                <div key={participant.id} className={participant.winner ? "is-winner" : ""}>
                  <TeamLogo name={participant.name} src={participant.logo} size={40} />
                  <strong>{participant.name}</strong>
                </div>
              ))}
            </div>
            {contest.result?.displayValue && <p>{contest.result.displayValue}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

export function RosterPanels({ details }: { details: EventDetails; event?: SportsEvent }) {
  if (!details.lineups?.length) return null;
  // Individual sports should never show "alineación".
  if (details.family !== "team") return null;
  return (
    <section className="detail-section">
      <div className="section-head"><div><h2>{details.labels.rosterTitle}</h2></div></div>
      <div className="lineups">
        {details.lineups.map((roster) => (
          <div className="panel" key={roster.participantId}>
            <h2>{details.labels.rosterTitle} de {roster.participantName}</h2>
            {roster.players.length ? (
              <ul className="lineup-list">
                {roster.players.map((player) => (
                  <li key={`${roster.participantId}-${player.name}`}>
                    <span className="lineup-player">
                      {player.photo && <TeamLogo name={player.name} src={player.photo} size={26} />}
                      {player.number ? `${player.number} ` : ""}{player.name}
                    </span>
                    <small>{[player.position, player.nationality].filter(Boolean).join(" · ")}</small>
                  </li>
                ))}
              </ul>
            ) : <p>La información de plantilla aún no está disponible.</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

const timelineIcons: Array<[RegExp, string]> = [
  [/autogol/i, "⚽"],
  [/gol|touchdown|safety/i, "⚽"],
  [/campo/i, "🏈"],
  [/amarilla/i, "🟨"],
  [/roja/i, "🟥"],
  [/cambio/i, "🔁"],
  [/penal/i, "🎯"],
];

export function TimelinePanel({ details }: { details: EventDetails }) {
  if (!details.timeline?.length) return null;
  return (
    <section className="panel detail-section">
      <h2>Cronología del partido</h2>
      <ul className="timeline-list">
        {details.timeline.map((entry) => {
          const icon = timelineIcons.find(([pattern]) => pattern.test(entry.label))?.[1] || "•";
          return (
            <li key={entry.id} className={entry.scoring ? "is-scoring" : ""}>
              <span className="timeline-minute">{entry.minute || (entry.period ? `P${entry.period}` : "–")}</span>
              <span className="timeline-icon" aria-hidden>{icon}</span>
              <div className="timeline-body">
                <strong>
                  {entry.label}
                  {entry.player ? ` · ${entry.player}` : ""}
                </strong>
                <small>
                  {[
                    entry.teamName,
                    entry.assist ? `Asistencia: ${entry.assist}` : null,
                  ].filter(Boolean).join(" · ") || entry.text}
                </small>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function PlaysPanel({ details }: { details: EventDetails }) {
  if (!details.plays?.length) return null;
  return (
    <section className="panel detail-section">
      <h2>Momentos recientes</h2>
      <ul className="plays-list">
        {details.plays.map((play) => (
          <li key={play.id}>
            <small>{[play.period ? `P${play.period}` : null, play.clock].filter(Boolean).join(" · ")}</small>
            <span>{play.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PredictorPanel({ details, event }: { details: EventDetails; event: SportsEvent }) {
  if (!details.predictor) return null;
  const home = details.participants.find((item) => item.side === "home") || details.participants[0];
  const away = details.participants.find((item) => item.side === "away") || details.participants[1];
  return (
    <section className="panel detail-section predictor-panel">
      <h2>{details.predictor.label || "Probabilidades"}</h2>
      <p className="predictor-note">Estimación informativa de ESPN. No es una recomendación de apuesta.</p>
      <div className="predictor-bars">
        {home && details.predictor.homePct !== undefined && (
          <div>
            <div className="predictor-label"><span>{home.name}</span><strong>{details.predictor.homePct}%</strong></div>
            <div className="predictor-track"><i style={{ width: `${Math.min(100, details.predictor.homePct)}%` }} /></div>
          </div>
        )}
        {details.predictor.tiePct !== undefined && (
          <div>
            <div className="predictor-label"><span>Empate</span><strong>{details.predictor.tiePct}%</strong></div>
            <div className="predictor-track"><i style={{ width: `${Math.min(100, details.predictor.tiePct)}%` }} /></div>
          </div>
        )}
        {away && details.predictor.awayPct !== undefined && (
          <div>
            <div className="predictor-label"><span>{away.name}</span><strong>{details.predictor.awayPct}%</strong></div>
            <div className="predictor-track"><i style={{ width: `${Math.min(100, details.predictor.awayPct)}%` }} /></div>
          </div>
        )}
      </div>
      <small className="predictor-event">{event.league}</small>
    </section>
  );
}

export function ParticipantLink({
  event,
  name,
  slug,
  logo,
  size = 84,
}: {
  event: SportsEvent;
  name: string;
  slug: string;
  logo?: string;
  size?: number;
}) {
  return (
    <Link className="detail-team" href={participantHref(event, slug)}>
      <TeamLogo name={name} src={logo} size={size} />
      <h2>{name}</h2>
    </Link>
  );
}
