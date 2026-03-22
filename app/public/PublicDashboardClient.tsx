"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Note } from "@/lib/notes";
import CategoryBadge from "@/components/CategoryBadge";
import TagPill from "@/components/TagPill";
import { getWordCount, getReadTime } from "@/lib/notes";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PublicNoteCard({ note }: { note: Note }) {
  const wordCount = getWordCount(note.content);
  const readTime = getReadTime(note.content);

  return (
    <Link href={`/public/${note.id}`} style={{ textDecoration: "none" }}>
      <article className="note-card" style={{ padding: "1.25rem", height: "100%", borderRadius: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", gap: "0.75rem" }}>
          <h3 style={{
            color: "#ede9fe",
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "0.95rem",
            lineHeight: 1.4,
            flex: 1,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {note.title}
          </h3>
          <CategoryBadge category={note.category} />
        </div>

        {note.excerpt && (
          <p style={{
            color: "#7c6a9e",
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            lineHeight: 1.6,
            marginBottom: "0.75rem",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}>
            {note.excerpt}
          </p>
        )}

        {note.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.75rem" }}>
            {note.tags.slice(0, 4).map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
            {note.tags.length > 4 && (
              <span style={{ fontSize: "0.65rem", color: "#7c6a9e", fontFamily: "var(--font-sans)" }}>
                +{note.tags.length - 4}
              </span>
            )}
          </div>
        )}

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "0.75rem",
          borderTop: "1px solid #2e1f4a",
          marginTop: "auto",
        }}>
          <span style={{ color: "#7c6a9e", fontSize: "0.7rem", fontFamily: "var(--font-sans)" }}>
            {formatDate(note.created_at)}
          </span>
          <span style={{ color: "#7c6a9e", fontSize: "0.7rem", fontFamily: "var(--font-sans)" }}>
            {wordCount}w · {readTime}m read
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function PublicDashboardClient({ notes }: { notes: Note[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const allCategories = useMemo(() => {
    const unique = Array.from(new Set(notes.map((n) => n.category).filter(Boolean)));
    return ["All", ...unique];
  }, [notes]);

  const filtered = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch =
        !search ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
        n.excerpt?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || n.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [notes, search, activeCategory]);

  return (
    <div style={{ minHeight: "100vh", background: "#0f0b1a", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        {/* Read-only banner */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(196,181,253,0.06)",
          border: "1px solid rgba(196,181,253,0.2)",
          borderRadius: "6px",
          padding: "0.5rem 1rem",
          marginBottom: "1.75rem",
          width: "fit-content",
        }}>
          <span style={{ color: "#c4b5fd", fontFamily: "var(--font-sans)", fontSize: "0.72rem" }}>
            ✦ public view · read-only
          </span>
        </div>

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <span style={{ color: "#c4b5fd", fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>
                ✦ cybernotes
              </span>
            </div>
            <h1 style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#ede9fe",
            }}>
              kanisha&apos;s notes
            </h1>
            <p style={{ color: "#7c6a9e", fontFamily: "var(--font-sans)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              {notes.length} note{notes.length !== 1 ? "s" : ""} · read-only
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ position: "relative", maxWidth: "480px" }}>
            <span style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#7c6a9e",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              pointerEvents: "none",
            }}>
              /search
            </span>
            <input
              type="text"
              placeholder="search by title, tag, or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-terminal"
              style={{ paddingLeft: "4.5rem" }}
            />
          </div>
        </div>

        {/* Category tabs */}
        <div style={{
          display: "flex",
          gap: "0.4rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
          paddingBottom: "1.25rem",
          borderBottom: "1px solid #2e1f4a",
        }}>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? "rgba(196,181,253,0.1)" : "transparent",
                border: `1px solid ${activeCategory === cat ? "#c4b5fd" : "#2e1f4a"}`,
                color: activeCategory === cat ? "#c4b5fd" : "#7c6a9e",
                fontFamily: "var(--font-sans)",
                fontSize: "0.7rem",
                padding: "0.3rem 0.75rem",
                cursor: "pointer",
                transition: "all 0.2s",
                borderRadius: "4px",
                boxShadow: activeCategory === cat ? "0 0 10px rgba(196,181,253,0.2)" : "none",
              }}
            >
              {cat === "All" ? "ALL" : cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Notes grid */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "5rem 1rem",
            border: "1px dashed #2e1f4a",
            borderRadius: "8px",
          }}>
            <p style={{
              fontFamily: "var(--font-sans)",
              color: "#7c6a9e",
              fontSize: "0.85rem",
            }}>
              {search || activeCategory !== "All" ? "no notes match your search" : "no notes yet"}
            </p>
          </div>
        ) : (
          <div
            className="card-stagger"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {filtered.map((note) => (
              <PublicNoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
