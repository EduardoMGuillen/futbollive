import Link from "next/link";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Brand compact />
          <p>Tu guía deportiva para descubrir cuándo y dónde juegan tus equipos favoritos.</p>
        </div>
        <div>
          <strong>Explorar</strong>
          <Link href="/en-vivo">En vivo</Link>
          <Link href="/resultados">Resultados</Link>
          <Link href="/deporte/futbol">Fútbol</Link>
          <Link href="/deporte/baloncesto">Baloncesto</Link>
        </div>
        <div>
          <strong>Información</strong>
          <Link href="/contacto">Contacto</Link>
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/terminos">Términos</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Dónde Juega</span>
        <span>No alojamos ni transmitimos contenido deportivo.</span>
      </div>
    </footer>
  );
}
