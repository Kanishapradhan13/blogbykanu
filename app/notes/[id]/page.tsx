import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getNoteById, getWordCount, getReadTime } from "@/lib/notes";
import Navbar from "@/components/Navbar";
import MarkdownPreview from "@/components/MarkdownPreview";
import CategoryBadge from "@/components/CategoryBadge";
import TagPill from "@/components/TagPill";
import DeleteButton from "@/components/DeleteButton";
import { deleteNoteAction } from "./actions";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function NoteViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const note = await getNoteById(userId, id);
  if (!note) redirect("/dashboard");

  const wordCount = getWordCount(note.content);
  const readTime = getReadTime(note.content);

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "calc(100vh - 56px)", background: "#0f0b1a", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

          {/* Breadcrumb */}
          <div style={{ marginBottom: "1.5rem" }}>
            <Link
              href="/dashboard"
              style={{
                color: "#7c6a9e",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.8rem",
                textDecoration: "none",
              }}
            >
              ← /dashboard
            </Link>
          </div>

          {/* Note header */}
          <div style={{
            background: "#1a1228",
            border: "1px solid #2e1f4a",
            borderRadius: "10px",
            padding: "1.75rem",
            marginBottom: "1.5rem",
          }}>
            {/* Category + Actions row */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}>
              <CategoryBadge category={note.category} />

              {/* Edit + Delete at top corner */}
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <Link
                  href={`/notes/${note.id}/edit`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.4rem 0.9rem",
                    border: "1px solid rgba(196,181,253,0.4)",
                    color: "#c4b5fd",
                    background: "rgba(196,181,253,0.06)",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.75rem",
                    textDecoration: "none",
                    borderRadius: "6px",
                    transition: "all 0.2s",
                  }}
                >
                  ✏ edit
                </Link>
                <DeleteButton noteId={note.id} deleteAction={deleteNoteAction} />
              </div>
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#ede9fe",
              lineHeight: 1.3,
              marginBottom: "1rem",
            }}>
              {note.title}
            </h1>

            {/* Tags */}
            {note.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
                {note.tags.map((tag) => (
                  <TagPill key={tag} tag={tag} />
                ))}
              </div>
            )}

            {/* Meta */}
            <div style={{
              display: "flex",
              gap: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #2e1f4a",
              flexWrap: "wrap",
            }}>
              {[
                { label: "created", value: formatDate(note.created_at) },
                { label: "last edited", value: formatDate(note.updated_at) },
                { label: "words", value: String(wordCount) },
                { label: "read time", value: `~${readTime} min` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <span style={{ color: "#7c6a9e", fontFamily: "JetBrains Mono, monospace", fontSize: "0.65rem", display: "block" }}>
                    {label}
                  </span>
                  <span style={{ color: "#ede9fe", fontFamily: "JetBrains Mono, monospace", fontSize: "0.78rem" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Note content */}
          <div style={{
            background: "#1a1228",
            border: "1px solid #2e1f4a",
            borderRadius: "10px",
            padding: "2rem",
          }}>
            <MarkdownPreview content={note.content} />
          </div>

          {/* Bottom actions */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
            <Link href="/dashboard" className="btn-neon btn-neon-green" style={{ padding: "0.6rem 1.25rem", fontSize: "0.8rem" }}>
              ← back
            </Link>
            <Link href={`/notes/${note.id}/edit`} className="btn-neon btn-neon-cyan" style={{ padding: "0.6rem 1.25rem", fontSize: "0.8rem" }}>
              ✏ edit note
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
