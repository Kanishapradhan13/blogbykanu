"use client";

import { useState, useEffect, useCallback } from "react";
import { useFormStatus } from "react-dom";
import dynamic from "next/dynamic";
import type { Note } from "@/lib/notes";
import CategoryBadge from "./CategoryBadge";

const MarkdownPreview = dynamic(() => import("./MarkdownPreview"), { ssr: false });

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-solid-green btn-neon"
      style={{ opacity: pending ? 0.6 : 1, cursor: pending ? "not-allowed" : "pointer" }}
    >
      {pending
        ? mode === "create" ? "creating..." : "saving..."
        : mode === "create" ? "create note ✦" : "save changes ✦"}
    </button>
  );
}

interface NoteFormProps {
  action: (formData: FormData) => Promise<void>;
  mode: "create" | "edit";
  note?: Note;
}

export default function NoteForm({ action, mode, note }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [category, setCategory] = useState(note?.category ?? "General");
  const [tags, setTags] = useState(note?.tags?.join(", ") ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      const form = document.getElementById("note-form") as HTMLFormElement;
      if (form) form.requestSubmit();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "#0f0b1a", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ color: "#7c6a9e", fontFamily: "var(--font-sans)", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
              ✦ {mode === "create" ? "new note" : "edit note"}
            </p>
            <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.25rem", fontWeight: 700, color: "#ede9fe" }}>
              {mode === "create" ? "Create Note" : "Edit Note"}
            </h1>
          </div>
          <span style={{ color: "#3d2f5a", fontFamily: "var(--font-sans)", fontSize: "0.7rem" }}>
            ⌘S to save
          </span>
        </div>

        <form id="note-form" action={action}>

          {/* Title + Category row */}
          <div
            className="title-category-row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "1rem",
              marginBottom: "1rem",
              alignItems: "start",
            }}
          >
            <div>
              <label style={{ display: "block", color: "#7c6a9e", fontFamily: "var(--font-sans)", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
                title
              </label>
              <input
                name="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                required
                className="input-terminal"
                style={{ fontSize: "1rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", color: "#7c6a9e", fontFamily: "var(--font-sans)", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
                category
              </label>
              <input
                name="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. DBMS, Backend, DSA..."
                className="input-terminal"
                style={{ minWidth: "180px" }}
              />
            </div>
          </div>

          {/* Category preview */}
          {category && (
            <div style={{ marginBottom: "1rem" }}>
              <CategoryBadge category={category} />
            </div>
          )}

          {/* Tags */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", color: "#7c6a9e", fontFamily: "var(--font-sans)", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
              tags <span style={{ opacity: 0.5 }}>(comma-separated)</span>
            </label>
            <input
              name="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="sql, system-design, react, algorithms..."
              className="input-terminal"
            />
          </div>

          {/* Write / Preview tabs */}
          <div style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem" }}>
            {(["write", "preview"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  background: tab === t ? "rgba(196,181,253,0.1)" : "transparent",
                  border: `1px solid ${tab === t ? "#c4b5fd" : "#2e1f4a"}`,
                  color: tab === t ? "#c4b5fd" : "#7c6a9e",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  padding: "0.3rem 0.75rem",
                  cursor: "pointer",
                  borderRadius: "4px",
                  transition: "all 0.2s",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Split editor / preview — stacks to 1 col on mobile via .split-editor */}
          <div
            className="split-editor"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {/* Editor */}
            <div style={{ display: tab === "preview" ? "none" : "flex", flexDirection: "column" }} className="split-editor-write">
              <div style={{
                background: "#1a1228",
                border: "1px solid #2e1f4a",
                borderRadius: "6px 6px 0 0",
                padding: "0.4rem 0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
                <span style={{ color: "#7c6a9e", fontSize: "0.7rem", fontFamily: "var(--font-sans)" }}>
                  editor.md
                </span>
                <span style={{ marginLeft: "auto", color: "#3d2f5a", fontSize: "0.65rem", fontFamily: "var(--font-sans)" }}>
                  {content.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={"# My Note\n\nStart writing in **markdown**...\n\n```sql\nSELECT * FROM notes WHERE user_id = ?;\n```"}
                required
                rows={24}
                style={{
                  flex: 1,
                  background: "#130f20",
                  border: "1px solid #2e1f4a",
                  borderTop: "none",
                  borderRadius: "0 0 6px 6px",
                  color: "#ede9fe",
                  fontFamily: "Fira Code, JetBrains Mono, monospace",
                  fontSize: "0.83rem",
                  lineHeight: 1.7,
                  padding: "1rem",
                  outline: "none",
                  resize: "vertical",
                  minHeight: "400px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#c4b5fd";
                  e.target.style.boxShadow = "0 0 0 1px rgba(196,181,253,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#2e1f4a";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Preview */}
            <div style={{ display: tab === "write" ? "none" : "flex", flexDirection: "column" }} className="split-editor-preview">
              <div style={{
                background: "#1a1228",
                border: "1px solid #2e1f4a",
                borderRadius: "6px 6px 0 0",
                padding: "0.4rem 0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
                <span style={{ color: "#7c6a9e", fontSize: "0.7rem", fontFamily: "var(--font-sans)" }}>
                  preview
                </span>
                <span style={{ marginLeft: "auto", color: "#c4b5fd", fontSize: "0.65rem", fontFamily: "var(--font-sans)" }}>
                  ✦ live
                </span>
              </div>
              <div style={{
                flex: 1,
                background: "#1a1228",
                border: "1px solid #2e1f4a",
                borderTop: "none",
                borderRadius: "0 0 6px 6px",
                padding: "1rem",
                overflowY: "auto",
                minHeight: "400px",
              }}>
                <MarkdownPreview content={content} />
              </div>
            </div>
          </div>

          {/* On desktop, also show preview alongside — override the hide above */}
          <style>{`
            @media (min-width: 769px) {
              .split-editor-write,
              .split-editor-preview {
                display: flex !important;
              }
            }
          `}</style>

          {/* Actions */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <SubmitButton mode={mode} />
            <a
              href={mode === "edit" && note ? `/notes/${note.id}` : "/dashboard"}
              className="btn-neon btn-neon-cyan"
              style={{ padding: "0.75rem 1.5rem", fontSize: "0.875rem" }}
            >
              cancel
            </a>
          </div>

        </form>
      </div>
    </div>
  );
}
