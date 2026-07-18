import Link from "next/link";

export default function NotFound() {
  return <div className="container legal-page" style={{ textAlign: "center" }}>
    <span className="eyebrow" style={{ justifyContent: "center" }}><i /> Error 404</span>
    <h1>No encontramos ese evento</h1>
    <p>Puede que el partido haya cambiado de nombre, terminado o todavía no esté disponible.</p>
    <Link className="primary-btn" href="/en-vivo">Ver agenda completa</Link>
  </div>;
}
