"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Note } from "@/lib/notes";
import { CATEGORIES } from "@/lib/notes";
import NoteCard from "@/components/NoteCard";

const ALL_CATEGORIES = ["All", ...CATEGORIES] as const;

export default function DashboardClient({
  notes,
  username,
}: {
  notes: Note[];
  username: string;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

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
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <span style={{ color: "#c4b5fd", fontFamily: "JetBrains Mono, monospace", fontSize: "0.85rem" }}>
                ✦ cybernotes
              </span>
            </div>
            <h1
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#ede9fe",
              }}
            >
              Welcome back,{" "}
              <span style={{ color: "#c4b5fd", textShadow: "0 0 10px rgba(196,181,253,0.4)" }}>
                {username}
              </span>
            </h1>
            <p style={{ color: "#7c6a9e", fontFamily: "JetBrains Mono, monospace", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              {notes.length} note{notes.length !== 1 ? "s" : ""} in your collection
            </p>
          </div>

          <Link href="/notes/new" className="btn-solid-green btn-neon">
            + New Note
          </Link>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ position: "relative", maxWidth: "480px" }}>
            <span
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#7c6a9e",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.85rem",
                pointerEvents: "none",
              }}
            >
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
        <div
          style={{
            display: "flex",
            gap: "0.4rem",
            flexWrap: "wrap",
            marginBottom: "2rem",
            paddingBottom: "1.25rem",
            borderBottom: "1px solid #2e1f4a",
          }}
        >
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? "rgba(196,181,253,0.1)" : "transparent",
                border: `1px solid ${activeCategory === cat ? "#c4b5fd" : "#2e1f4a"}`,
                color: activeCategory === cat ? "#c4b5fd" : "#7c6a9e",
                fontFamily: "JetBrains Mono, monospace",
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
          <div
            style={{
              textAlign: "center",
              padding: "5rem 1rem",
              border: "1px dashed #2e1f4a",
              borderRadius: "8px",
            }}
          >
            <p
              style={{
                fontFamily: "JetBrains Mono, monospace",
                color: "#7c6a9e",
                fontSize: "0.85rem",
                marginBottom: "0.5rem",
              }}
            >
              {search || activeCategory !== "All"
                ? "no notes match your search"
                : "your collection is empty"}
            </p>
            {!search && activeCategory === "All" && (
              <Link
                href="/notes/new"
                style={{
                  color: "#c4b5fd",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.8rem",
                  textDecoration: "none",
                }}
              >
                write your first note ✦
              </Link>
            )}
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
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
