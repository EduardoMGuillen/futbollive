import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, type BlogBlock } from "@/lib/blog-posts";
import { linkBlogMentions, WORLD_CUP_BLOG_LINKS } from "@/lib/blog-links";
import { siteUrl } from "@/lib/utils";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Artículo" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.description, url: `/blog/${post.slug}` },
  };
}

function renderBlock(block: BlogBlock, index: number) {
  if (block.type === "h2") return <h2 key={index}>{block.content}</h2>;
  if (block.type === "ul") {
    return (
      <ul key={index} className="legal-list">
        {block.items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    );
  }
  if (block.type === "link") {
    return (
      <p key={index} className="blog-cta-wrap">
        <Link href={block.href} className="blog-cta">
          <span>
            <strong>{block.label}</strong>
            {block.hint && <small>{block.hint}</small>}
          </span>
          <ChevronRight size={18} />
        </Link>
      </p>
    );
  }
  return <p key={index}>{linkBlogMentions(block.content, WORLD_CUP_BLOG_LINKS)}</p>;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const base = siteUrl();
  const url = `${base}/blog/${post.slug}`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        url,
        author: { "@type": "Organization", name: "Dónde Juega" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: base },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${base}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <article className="container blog-article legal-page">
        <div className="blog-meta">
          <Link href="/blog">← Blog</Link>
          <span>{post.category}</span>
          <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString("es-419", { day: "numeric", month: "long", year: "numeric" })}</time>
        </div>
        <h1>{post.title}</h1>
        <p className="blog-lead">{linkBlogMentions(post.description, WORLD_CUP_BLOG_LINKS)}</p>
        {post.relatedMatchSlug && (
          <Link href={`/partido/${post.relatedMatchSlug}`} className="blog-match-banner">
            <span>
              <small>PARTIDO RELACIONADO</small>
              <strong>Abrir ficha del encuentro</strong>
            </span>
            <ChevronRight size={20} />
          </Link>
        )}
        {post.body.map((block, index) => renderBlock(block, index))}
        <p className="editorial-note" style={{ marginTop: 32 }}>Datos de marcadores y horarios verificados con ESPN cuando están disponibles.</p>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
    </>
  );
}
