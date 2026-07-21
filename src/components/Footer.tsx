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
          <Link href="/deportes">Todos los deportes</Link>
          <Link href="/esports">Esports</Link>
          <Link href="/resultados">Resultados</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/deporte/futbol">Fútbol</Link>
          <Link href="/deporte/baloncesto">Baloncesto</Link>
        </div>
        <div>
          <strong>Información</strong>
          <Link href="/acerca-de">Acerca de</Link>
          <Link href="/contacto">Contacto</Link>
          <a href="mailto:hola@dondejuega.com">hola@dondejuega.com</a>
          <Link href="/privacidad">Política de privacidad</Link>
          <Link href="/terminos">Términos de uso</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Dónde Juega</span>
        <span>
          Contacto: <a href="mailto:hola@dondejuega.com">hola@dondejuega.com</a>
        </span>
        <span>No alojamos ni transmitimos contenido deportivo.</span>
      </div>
    </footer>
  );
}
