import type { Metadata } from "next";
import Link from "next/link";
import { getEspnSportsCatalog } from "@/lib/espn";
import { readStore } from "@/lib/store";
import { ensureFreshEvents } from "@/lib/sync";
import { sportIcon } from "@/lib/sports";
import { isPubliclyVisible } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Todos los deportes: fútbol, tenis, NBA, F1, UFC y más",
  description: "Explora la agenda completa por deporte: fútbol, baloncesto, béisbol, tenis, automovilismo, MMA, golf, rugby y más.",
  alternates: { canonical: "/deportes" },
};
export const dynamic = "force-dynamic";

export default async function SportsIndexPage() {
  await ensureFreshEvents();
  const catalog = getEspnSportsCatalog();
  const data = await readStore();
  const counts = new Map<string, number>();
  for (const event of data.events) {
    if (event.hidden || !isPubliclyVisible(event)) continue;
    counts.set(event.sportSlug, (counts.get(event.sportSlug) || 0) + 1);
  }

  return (
    <>
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><Link href="/">Inicio</Link> / Deportes</div>
        <h1>Todos los deportes</h1>
        <p>Elige un deporte para ver su agenda, horarios locales y dónde se transmite cada evento.</p>
      </div></section>
      <main className="container content-section">
        <div className="sports-directory">
          {catalog.map((sport) => {
            const count = counts.get(sport.slug) || 0;
            return (
              <Link key={sport.slug} href={`/deporte/${sport.slug}`} className="sport-tile">
                <span className="sport-tile-icon" aria-hidden>{sportIcon(sport.slug)}</span>
                <strong>{sport.name}</strong>
                <small>{count > 0 ? `${count} evento${count === 1 ? "" : "s"}` : "Sin eventos ahora"}</small>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
