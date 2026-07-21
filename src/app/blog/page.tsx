import type { Metadata } from "next";
import Link from "next/link";
import { BlogFilters } from "@/components/BlogFilters";
import { getAllPosts, getBlogCategories, getBlogMonths } from "@/lib/blog-posts";
import { siteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog deportivo: NBA, Liga MX, F1, UFC, esports y más",
  description:
    "Crónicas y guías de Mundial, NBA, MLB, Fórmula 1, Liga MX, UFC, Valorant y League of Legends. Filtra por categoría, fecha o búsqueda.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const categories = getBlogCategories();
  const months = getBlogMonths();
  const base = siteUrl();
  const graph = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Blog Dónde Juega",
    url: `${base}/blog`,
    description:
      "Crónicas y guías de Mundial, NBA, MLB, Fórmula 1, Liga MX, UFC, Valorant y League of Legends.",
  };

  return (
    <>
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><Link href="/">Inicio</Link> / Blog</div>
        <h1>Blog</h1>
        <p>Crónicas, resultados y guías de fútbol, NBA, MLB, F1, UFC y esports. Filtra por deporte, mes o busca por texto.</p>
      </div></section>
      <main className="container content-section blog-index">
        <BlogFilters posts={posts} categories={categories} months={months} />
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
    </>
  );
}
