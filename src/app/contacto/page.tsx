import { Mail, Megaphone, ShieldCheck } from "lucide-react";

export const metadata = { title: "Contacto y publicidad" };

export default function ContactPage() {
  return <article className="container legal-page">
    <span className="eyebrow"><i /> Hablemos</span>
    <h1>Contacto y publicidad</h1>
    <p>¿Quieres anunciar tu marca, reportar un dato incorrecto o proponer una alianza? Elige el motivo y escríbenos.</p>
    <div className="events-grid">
      <div className="panel"><Megaphone color="var(--green)" /><h2>Publicidad</h2><p>Banners premium, patrocinios por deporte y campañas para audiencias deportivas.</p></div>
      <div className="panel"><ShieldCheck color="var(--green)" /><h2>Correcciones</h2><p>Reporta horarios, sedes o información que necesite revisión editorial.</p></div>
    </div>
    <a className="primary-btn" style={{ marginTop: 24 }} href="mailto:hola@dondejuega.com"><Mail size={18} /> hola@dondejuega.com</a>
  </article>;
}
