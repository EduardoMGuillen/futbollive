import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Megaphone, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto y publicidad",
  description:
    "Contacta con Dónde Juega: correcciones de datos, alianzas, publicidad directa y consultas sobre privacidad. Respondemos por correo en hola@dondejuega.com.",
  alternates: { canonical: "/contacto" },
};

export default function ContactPage() {
  return (
    <article className="container legal-page">
      <div className="breadcrumbs" style={{ marginBottom: 16 }}>
        <Link href="/">Inicio</Link> / Contacto
      </div>
      <span className="eyebrow"><i /> Hablemos</span>
      <h1>Contacto</h1>
      <p>
        Operamos <strong>Dónde Juega</strong> como guía deportiva independiente. Si tienes dudas sobre el sitio,
        privacidad, datos incorrectos o quieres anunciarte, escríbenos directamente.
      </p>

      <div className="panel" style={{ marginTop: 24, marginBottom: 24 }}>
        <h2>Correo de contacto</h2>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:hola@dondejuega.com">hola@dondejuega.com</a>
        </p>
        <p>
          Tiempo habitual de respuesta: <strong>1–3 días hábiles</strong>. Para temas de privacidad indica
          “Privacidad” en el asunto.
        </p>
        <p>
          También puedes revisar la <Link href="/privacidad">Política de privacidad</Link> y{" "}
          <Link href="/acerca-de">Acerca de</Link>.
        </p>
      </div>

      <div className="events-grid">
        <div className="panel">
          <Megaphone color="var(--green)" />
          <h2>Publicidad</h2>
          <p>Banners premium, patrocinios por deporte y campañas para audiencias deportivas.</p>
        </div>
        <div className="panel">
          <ShieldCheck color="var(--green)" />
          <h2>Correcciones</h2>
          <p>Reporta horarios, sedes o información que necesite revisión editorial.</p>
        </div>
      </div>
      <a className="primary-btn" style={{ marginTop: 24 }} href="mailto:hola@dondejuega.com">
        <Mail size={18} /> Enviar correo a hola@dondejuega.com
      </a>
    </article>
  );
}
