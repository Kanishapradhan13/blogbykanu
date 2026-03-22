import Link from "next/link";
import type { Note } from "@/lib/notes";
import { getWordCount, getReadTime } from "@/lib/notes";
import CategoryBadge from "./CategoryBadge";
import TagPill from "./TagPill";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NoteCard({ note }: { note: Note }) {
  const wordCount = getWordCount(note.content);
  const readTime = getReadTime(note.content);

  return (
    <Link href={`/notes/${note.id}`} style={{ textDecoration: "none" }}>
      <article className="note-card" style={{ padding: "1.25rem", height: "100%", borderRadius: "8px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", gap: "0.75rem" }}>
          <h3
            style={{
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
            }}
          >
            {note.title}
          </h3>
          <CategoryBadge category={note.category} />
        </div>

        {/* Excerpt */}
        {note.excerpt && (
          <p
            style={{
              color: "#7c6a9e",
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              lineHeight: 1.6,
              marginBottom: "0.75rem",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {note.excerpt}
          </p>
        )}

        {/* Tags */}
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

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "0.75rem",
            borderTop: "1px solid #2e1f4a",
            marginTop: "auto",
          }}
        >
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
