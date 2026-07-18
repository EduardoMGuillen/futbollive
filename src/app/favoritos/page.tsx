import type { Metadata } from "next";
import { FavoritesClient } from "@/components/FavoritesClient";

export const metadata: Metadata = {
  title: "Mis partidos favoritos",
  description: "Consulta tus partidos guardados y activa recordatorios locales antes de que comiencen.",
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <>
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs">Inicio / Favoritos</div>
        <h1>Mis favoritos</h1>
        <p>Tus partidos guardados, sin cuentas ni registro.</p>
      </div></section>
      <section className="container content-section">
        <FavoritesClient />
      </section>
    </>
  );
}
