import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de uso",
  description:
    "Condiciones de uso de Dónde Juega: guía informativa, exactitud de datos, marcas, publicidad y uso aceptable.",
  alternates: { canonical: "/terminos" },
};

export default function TermsPage() {
  return (
    <article className="container legal-page">
      <div className="breadcrumbs" style={{ marginBottom: 16 }}>
        <Link href="/">Inicio</Link> / Términos
      </div>
      <h1>Términos de uso</h1>
      <p>Última actualización: 19 de julio de 2026.</p>
      <p>
        Al usar <strong>Dónde Juega</strong> (<Link href="https://dondejuega.com">dondejuega.com</Link>)
        aceptas estos términos. Si no estás de acuerdo, no utilices el sitio.
      </p>

      <h2>1. Descripción del servicio</h2>
      <p>
        Dónde Juega es una <strong>guía informativa independiente</strong> de eventos deportivos y esports:
        horarios, sedes, marcadores, resultados, plantillas/rosters y referencias a canales de transmisión.
        El servicio se ofrece “tal cual”, sin garantía de disponibilidad continua.
      </p>

      <h2>2. No transmitimos eventos</h2>
      <p>
        Este sitio <strong>no aloja, reproduce ni retransmite</strong> señales deportivas. Tampoco enlazamos
        de forma deliberada a fuentes no autorizadas. La sección “Dónde se transmite” muestra información de
        broadcasters oficiales cuando está disponible o enlaces a plataformas legales. La disponibilidad
        depende de tu país y de los derechos de cada organizador.
      </p>

      <h2>3. Exactitud de los datos</h2>
      <p>
        Horarios, sedes, marcadores, alineaciones, canales y estadísticas pueden cambiar sin previo aviso.
        Sincronizamos fuentes externas (como ESPN y PandaScore) y revisamos eventos destacados, pero
        <strong> no garantizamos exactitud absoluta</strong>. Confirma siempre información crítica con
        organizadores, ligas o emisoras oficiales.
      </p>

      <h2>4. Uso aceptable</h2>
      <p>Te comprometes a no:</p>
      <ul className="legal-list">
        <li>Usar el sitio para publicar o promover transmisiones ilegales.</li>
        <li>Intentar sobrecargar, alterar o vulnerar la seguridad del sitio o sus APIs.</li>
        <li>Extraer datos de forma masiva automatizada (scraping agresivo) sin autorización.</li>
        <li>Suplantar identidades o engañar a otros usuarios.</li>
        <li>Usar el contenido de forma que infrinja derechos de terceros.</li>
      </ul>

      <h2>5. Cuentas y favoritos</h2>
      <p>
        No es obligatorio crear una cuenta. Los favoritos y recordatorios se guardan en tu navegador.
        Si borras los datos del sitio o usas otro dispositivo, esas preferencias no se conservarán.
      </p>

      <h2>6. Marcas, escudos y contenido de terceros</h2>
      <p>
        Nombres de equipos, jugadores, ligas, torneos, logotipos y marcas pertenecen a sus respectivos
        titulares. Se muestran con fines informativos e identificativos. Los datos deportivos pueden
        provenir de terceros; sus términos también pueden aplicar a esa información.
      </p>

      <h2>7. Publicidad y enlaces</h2>
      <p>
        Podemos mostrar anuncios (incluido Google AdSense) y enlaces a sitios externos. No controlamos el
        contenido de terceros ni somos responsables de sus prácticas. Algunos enlaces pueden ser comerciales
        o patrocinados y estarán identificados cuando corresponda.
      </p>

      <h2>8. Propiedad intelectual del sitio</h2>
      <p>
        El diseño, textos propios, organización editorial y código de Dónde Juega están protegidos. Puedes
        consultar el sitio para uso personal. Queda prohibida la reproducción masiva o comercial del
        contenido editorial sin permiso.
      </p>

      <h2>9. Limitación de responsabilidad</h2>
      <p>
        En la máxima medida permitida por la ley, Dónde Juega no responde por daños derivados de horarios
        incorrectos, canales no disponibles, interrupciones del servicio, anuncios de terceros o decisiones
        tomadas con base en la información del sitio.
      </p>

      <h2>10. Cambios</h2>
      <p>
        Podemos modificar estos términos. El uso continuado del sitio tras la publicación de cambios implica
        su aceptación. La fecha de actualización aparece al inicio de esta página.
      </p>

      <h2>11. Contacto</h2>
      <p>
        Consultas: <a href="mailto:hola@dondejuega.com">hola@dondejuega.com</a> ·{" "}
        <Link href="/contacto">Contacto</Link> · <Link href="/acerca-de">Acerca de</Link> ·{" "}
        <Link href="/privacidad">Privacidad</Link>
      </p>
    </article>
  );
}
