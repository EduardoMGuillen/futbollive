import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acerca de Dónde Juega",
  description:
    "Dónde Juega es una guía deportiva independiente para Latinoamérica: horarios locales, marcadores, resultados y dónde ver fútbol, NBA, tenis, F1, UFC y esports.",
  alternates: { canonical: "/acerca-de" },
};

export default function AboutPage() {
  return (
    <article className="container legal-page">
      <div className="breadcrumbs" style={{ marginBottom: 16 }}>
        <Link href="/">Inicio</Link> / Acerca de
      </div>
      <span className="eyebrow"><i /> Quiénes somos</span>
      <h1>Acerca de Dónde Juega</h1>
      <p>
        Dónde Juega es una guía deportiva digital independiente pensada para fans de Latinoamérica.
        Nuestro objetivo es simple: decirte <strong>cuándo</strong> se juega, <strong>quién</strong> participa
        y <strong>dónde</strong> puedes seguir cada evento, en tu hora local.
      </p>

      <h2>Qué ofrecemos</h2>
      <p>
        Publicamos agenda, marcadores en vivo, resultados y páginas de partidos, equipos, atletas y esports
        (Valorant, League of Legends y Counter-Strike 2). También mostramos canales oficiales cuando están
        disponibles y permitimos guardar favoritos en tu navegador sin crear una cuenta.
      </p>
      <ul className="legal-list">
        <li>Fútbol, baloncesto, béisbol, tenis, automovilismo, MMA, golf y más deportes.</li>
        <li>Horarios convertidos a la zona horaria de tu dispositivo.</li>
        <li>Secciones de resultados, en vivo y favoritos con recordatorios locales.</li>
        <li>Guías de transmisión con enlaces a plataformas oficiales cuando existen.</li>
      </ul>

      <h2>Qué no hacemos</h2>
      <p>
        <strong>No alojamos, retransmitimos ni enlazamos señales pirata.</strong> No somos un servicio de streaming.
        Cuando indicamos “dónde se transmite”, nos referimos a información de canales y plataformas oficiales
        reportadas por fuentes deportivas o a destinos legales verificados.
      </p>

      <h2>Cómo actualizamos la información</h2>
      <p>
        Combinamos datos de APIs deportivas (como ESPN y PandaScore para esports) con revisión editorial.
        Los horarios, sedes, alineaciones y canales pueden cambiar por decisiones de ligas, equipos o
        broadcasters. Por eso el sitio se sincroniza con frecuencia y prioriza eventos relevantes para la región.
      </p>

      <h2>Publicidad</h2>
      <p>
        Monetizamos con espacios publicitarios claramente identificados (por ejemplo Google AdSense) para
        mantener el servicio gratuito. Los anuncios no condicionan la información editorial de los eventos.
        Si quieres anunciarte con nosotros, visita <Link href="/contacto">Contacto</Link>.
      </p>

      <h2>Contacto</h2>
      <p>
        Para correcciones, alianzas o consultas generales:{" "}
        <a href="mailto:hola@dondejuega.com">hola@dondejuega.com</a>
      </p>
      <p>
        También puedes revisar nuestra <Link href="/privacidad">Política de privacidad</Link> y los{" "}
        <Link href="/terminos">Términos de uso</Link>.
      </p>
    </article>
  );
}
