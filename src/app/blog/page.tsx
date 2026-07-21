import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog-posts";
import { siteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog deportivo: Mundial 2026, guías y crónicas",
  description: "Artículos editoriales sobre el Mundial 2026, resultados, selecciones y cómo seguir el deporte en Dónde Juega.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const base = siteUrl();
  const graph = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Blog Dónde Juega",
    url: `${base}/blog`,
  };

  return (
    <>
      <section className="page-hero"><div className="container">
        <div className="breadcrumbs"><Link href="/">Inicio</Link> / Blog</div>
        <h1>Blog</h1>
        <p>Guías, resultados y crónicas del Mundial 2026 y más competiciones.</p>
      </div></section>
      <main className="container content-section blog-index">
        <div className="blog-grid">
          {posts.map((post) => (
            <Link href={`/blog/${post.slug}`} className="blog-card" key={post.slug}>
              <span className="blog-card-emoji" aria-hidden>{post.coverEmoji}</span>
              <small>{post.category}</small>
              <strong>{post.title}</strong>
              <p>{post.description}</p>
              <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString("es-419", { day: "numeric", month: "long", year: "numeric" })}</time>
            </Link>
          ))}
        </div>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
    </>
  );
}
