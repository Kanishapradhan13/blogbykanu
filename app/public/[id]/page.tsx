import { redirect } from "next/navigation";
import Link from "next/link";
import { getPublicNoteById, getWordCount, getReadTime } from "@/lib/notes";
import Navbar from "@/components/Navbar";
import MarkdownPreview from "@/components/MarkdownPreview";
import CategoryBadge from "@/components/CategoryBadge";
import TagPill from "@/components/TagPill";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PublicNoteViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await getPublicNoteById(id);
  if (!note) redirect("/public");

  const wordCount = getWordCount(note.content);
  const readTime = getReadTime(note.content);

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "calc(100vh - 56px)", background: "#0f0b1a", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

          {/* Read-only badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(196,181,253,0.06)",
            border: "1px solid rgba(196,181,253,0.2)",
            borderRadius: "6px",
            padding: "0.35rem 0.75rem",
            marginBottom: "1.25rem",
          }}>
            <span style={{ color: "#c4b5fd", fontFamily: "var(--font-sans)", fontSize: "0.68rem" }}>
              ✦ public view · read-only
            </span>
          </div>

          {/* Breadcrumb */}
          <div style={{ marginBottom: "1.5rem" }}>
            <Link
              href="/public"
              style={{
                color: "#7c6a9e",
                fontFamily: "var(--font-sans)",
                fontSize: "0.8rem",
                textDecoration: "none",
              }}
            >
              ← /public
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
            <div style={{ marginBottom: "1.25rem" }}>
              <CategoryBadge category={note.category} />
            </div>

            <h1 style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#ede9fe",
              lineHeight: 1.3,
              marginBottom: "1rem",
            }}>
              {note.title}
            </h1>

            {note.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
                {note.tags.map((tag) => (
                  <TagPill key={tag} tag={tag} />
                ))}
              </div>
            )}

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
                  <span style={{ color: "#7c6a9e", fontFamily: "var(--font-sans)", fontSize: "0.65rem", display: "block" }}>
                    {label}
                  </span>
                  <span style={{ color: "#ede9fe", fontFamily: "var(--font-sans)", fontSize: "0.78rem" }}>
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

          {/* Bottom nav */}
          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/public" className="btn-neon btn-neon-green" style={{ padding: "0.6rem 1.25rem", fontSize: "0.8rem" }}>
              ← back
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
