import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { GlobalAd } from "@/components/GlobalAd";
import { Header } from "@/components/Header";
import { LiveRefresh } from "@/components/LiveRefresh";
import { adsenseClient, siteUrl } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Dónde Juega — Partidos de hoy y deportes en vivo",
    template: "%s | Dónde Juega",
  },
  description: "Consulta horarios, sedes, alineaciones y dónde ver los partidos más importantes de fútbol y todos tus deportes favoritos.",
  keywords: ["partidos de hoy", "dónde juega", "fútbol hoy", "deportes en vivo", "horarios deportivos"],
  openGraph: {
    type: "website",
    locale: "es_419",
    siteName: "Dónde Juega",
    images: [{ url: "/logo.png", width: 1254, height: 1254, alt: "Dónde Juega" }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.png", apple: "/icon.png" },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  other: adsenseClient() ? { "google-adsense-account": adsenseClient() as string } : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = siteUrl();
  const publisher = adsenseClient();
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site}/#organization`,
        name: "Dónde Juega",
        url: site,
        logo: { "@type": "ImageObject", url: `${site}/icon.png` },
      },
      {
        "@type": "WebSite",
        "@id": `${site}/#website`,
        url: site,
        name: "Dónde Juega",
        inLanguage: "es-419",
        publisher: { "@id": `${site}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${site}/buscar?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
  return (
    <html lang="es" data-theme="dark" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        {publisher && (
          <Script
            id="adsense"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`}
          />
        )}
        <LiveRefresh />
        <Header />
        <main className="site-main">{children}</main>
        <GlobalAd />
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
