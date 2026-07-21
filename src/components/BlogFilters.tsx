"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { formatBlogMonth, type BlogPost } from "@/lib/blog-posts";

type Props = {
  posts: BlogPost[];
  categories: string[];
  months: string[];
};

export function BlogFilters({ posts, categories, months }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [month, setMonth] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("es");
    return posts.filter((post) => {
      if (category !== "all" && post.category !== category) return false;
      if (month !== "all" && !post.publishedAt.startsWith(month)) return false;
      if (!q) return true;
      const haystack = [post.title, post.description, post.category, ...post.tags]
        .join(" ")
        .toLocaleLowerCase("es");
      return haystack.includes(q);
    });
  }, [posts, query, category, month]);

  const activeFilters = category !== "all" || month !== "all" || query.trim().length > 0;

  const clear = () => {
    setQuery("");
    setCategory("all");
    setMonth("all");
  };

  return (
    <div className="blog-filters-wrap">
      <form className="blog-filters" onSubmit={(event) => event.preventDefault()} aria-label="Filtrar artículos">
        <label className="blog-filter-field blog-filter-search">
          <span>Buscar</span>
          <div className="blog-search-input">
            <Search size={16} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Título, deporte, tag…"
              autoComplete="off"
            />
          </div>
        </label>
        <label className="blog-filter-field">
          <span>Categoría</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">Todas</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="blog-filter-field">
          <span>Fecha</span>
          <select value={month} onChange={(event) => setMonth(event.target.value)}>
            <option value="all">Cualquier mes</option>
            {months.map((ym) => (
              <option key={ym} value={ym}>{formatBlogMonth(ym)}</option>
            ))}
          </select>
        </label>
        {activeFilters && (
          <button type="button" className="secondary-btn blog-filter-clear" onClick={clear}>
            <X size={16} /> Limpiar
          </button>
        )}
      </form>

      <p className="blog-filter-count" aria-live="polite">
        {filtered.length === posts.length
          ? `${posts.length} artículos`
          : `${filtered.length} de ${posts.length} artículos`}
      </p>

      {filtered.length ? (
        <div className="blog-grid">
          {filtered.map((post) => (
            <Link href={`/blog/${post.slug}`} className="blog-card" key={post.slug}>
              <span className="blog-card-emoji" aria-hidden>{post.coverEmoji}</span>
              <small>{post.category}</small>
              <strong>{post.title}</strong>
              <p>{post.description}</p>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("es-419", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <strong>Sin resultados</strong>
          <span>Prueba otra categoría, mes o palabra clave.</span>
          <button type="button" className="primary-btn" style={{ marginTop: 16 }} onClick={clear}>
            Ver todos los artículos
          </button>
        </div>
      )}
    </div>
  );
}
