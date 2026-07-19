import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo Dónde Juega trata datos, cookies, favoritos locales, Google Analytics y Google AdSense.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacyPage() {
  return (
    <article className="container legal-page">
      <div className="breadcrumbs" style={{ marginBottom: 16 }}>
        <Link href="/">Inicio</Link> / Privacidad
      </div>
      <h1>Política de privacidad</h1>
      <p>Última actualización: 19 de julio de 2026.</p>
      <p>
        Esta política describe cómo <strong>Dónde Juega</strong> (<Link href="https://dondejuega.com">dondejuega.com</Link>)
        trata la información cuando visitas el sitio. Está pensada para usuarios de Latinoamérica y España.
      </p>

      <h2>1. Responsable</h2>
      <p>
        El responsable del sitio es el operador de Dónde Juega. Para ejercer derechos o hacer consultas de
        privacidad escribe a <a href="mailto:hola@dondejuega.com">hola@dondejuega.com</a>.
      </p>

      <h2>2. Qué información tratamos</h2>
      <p>En general no pedimos crear cuenta ni completar formularios de registro. Podemos tratar:</p>
      <ul className="legal-list">
        <li>
          <strong>Datos técnicos de navegación:</strong> dirección IP, tipo de dispositivo, navegador,
          páginas visitadas y tiempos aproximados de visita, a través de analítica y servidores de alojamiento.
        </li>
        <li>
          <strong>Preferencias locales:</strong> favoritos, recordatorios, región de canales y tema claro/oscuro.
          Se guardan en tu navegador (<code>localStorage</code>) y no se envían a una cuenta nuestra.
        </li>
        <li>
          <strong>Comunicaciones:</strong> si nos escribes por correo, trataremos el contenido necesario para
          responderte.
        </li>
      </ul>

      <h2>3. Cookies y tecnologías similares</h2>
      <p>Usamos o podemos usar:</p>
      <ul className="legal-list">
        <li>
          <strong>Cookies técnicas</strong> para el funcionamiento básico del sitio.
        </li>
        <li>
          <strong>Google Analytics (gtag.js)</strong> para medir visitas y uso del sitio (identificador{" "}
          <code>G-DB68T3MYWH</code>). Google puede procesar datos según su propia política.
        </li>
        <li>
          <strong>Google AdSense</strong> para mostrar anuncios. Google y sus socios pueden usar cookies o
          identificadores para servir anuncios, medir rendimiento y limitar la repetición de anuncios.
        </li>
      </ul>
      <p>
        Puedes gestionar cookies desde la configuración de tu navegador. Cuando la legislación lo exija
        (por ejemplo, en el Espacio Económico Europeo), se solicitará consentimiento mediante la plataforma
        de mensajes de privacidad de Google / AdSense.
      </p>
      <p>
        Más información sobre cómo Google usa datos al visitar sitios con sus partners:{" "}
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
          policies.google.com/technologies/partner-sites
        </a>
        .
      </p>

      <h2>4. Publicidad</h2>
      <p>
        Los espacios publicitarios están visibles y están etiquetados. No vendemos listados de datos personales.
        Los anuncios de terceros (incluido AdSense) se rigen también por las políticas de esos proveedores.
        Puedes optar por no recibir anuncios personalizados de Google en{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          adssettings.google.com
        </a>
        .
      </p>

      <h2>5. Fuentes deportivas</h2>
      <p>
        Los calendarios, marcadores, estadísticas y datos de transmisión pueden proceder de APIs públicas o
        licenciadas (por ejemplo ESPN y PandaScore). Esos proveedores no nos entregan perfiles personales de
        usuarios finales del sitio. No alojamos transmisiones deportivas.
      </p>

      <h2>6. Conservación y seguridad</h2>
      <p>
        Los datos de analítica y publicidad se conservan según los plazos de Google y del proveedor de
        alojamiento (Vercel). Las preferencias locales permanecen en tu dispositivo hasta que las borres.
        Aplicamos medidas razonables de seguridad (HTTPS, control de acceso al panel administrativo).
      </p>

      <h2>7. Menores</h2>
      <p>
        El sitio está dirigido a público general interesado en deportes. No recopilamos de forma consciente
        datos personales de menores de 13 años. Si eres padre o tutor y crees que un menor nos facilitó datos
        por correo, contáctanos para eliminarlos.
      </p>

      <h2>8. Tus derechos</h2>
      <p>
        Según tu país, puedes solicitar acceso, corrección o eliminación de datos personales que nos hayas
        enviado (por ejemplo, un correo). Para preferencias almacenadas solo en tu navegador, bórralas desde
        el propio dispositivo o la sección de favoritos.
      </p>

      <h2>9. Cambios</h2>
      <p>
        Podemos actualizar esta política. La fecha de “última actualización” al inicio indica la versión vigente.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Privacidad y consultas generales: <a href="mailto:hola@dondejuega.com">hola@dondejuega.com</a> ·{" "}
        <Link href="/contacto">Página de contacto</Link> · <Link href="/acerca-de">Acerca de</Link>
      </p>
    </article>
  );
}
