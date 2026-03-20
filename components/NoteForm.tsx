"use client";

import { useState, useEffect, useCallback } from "react";
import { useFormStatus } from "react-dom";
import dynamic from "next/dynamic";
import { CATEGORIES } from "@/lib/notes";
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
        ? mode === "create"
          ? "creating..."
          : "saving..."
        : mode === "create"
        ? "create_note"
        : "save_changes"}
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

  // Ctrl+S to submit
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        const form = document.getElementById("note-form") as HTMLFormElement;
        if (form) form.requestSubmit();
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "#0a0a0a", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ color: "#5a6478", fontFamily: "JetBrains Mono, monospace", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
              <span style={{ color: "#00ff9d" }}>&gt; </span>
              {mode === "create" ? "new_note" : "edit_note"}
            </p>
            <h1
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "1.25rem", fontWeight: 700, color: "#e0e0e0" }}
            >
              {mode === "create" ? "Create Note" : "Edit Note"}
            </h1>
          </div>
          <span style={{ color: "#5a6478", fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem" }}>
            Ctrl+S to save
          </span>
        </div>

        <form id="note-form" action={action}>
          {/* Title + Category row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "1rem",
              marginBottom: "1rem",
              alignItems: "start",
            }}
          >
            <div>
              <label style={{ display: "block", color: "#5a6478", fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
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
              <label style={{ display: "block", color: "#5a6478", fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
                category
              </label>
              <select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-terminal"
                style={{ minWidth: "180px", cursor: "pointer" }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} style={{ background: "#111318" }}>
                    {c}
                  </option>
                ))}
              </select>
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
            <label style={{ display: "block", color: "#5a6478", fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
              tags <span style={{ opacity: 0.5 }}>(comma-separated)</span>
            </label>
            <input
              name="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="nmap, sql-injection, linux-privesc..."
              className="input-terminal"
            />
          </div>

          {/* Editor/Preview toggle */}
          <div style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem" }}>
            {(["write", "preview"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  background: tab === t ? "rgba(0,255,157,0.1)" : "transparent",
                  border: `1px solid ${tab === t ? "#00ff9d" : "#1e2430"}`,
                  color: tab === t ? "#00ff9d" : "#5a6478",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.75rem",
                  padding: "0.3rem 0.75rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Split editor / preview */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {/* Editor */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  background: "#111318",
                  border: "1px solid #1e2430",
                  padding: "0.4rem 0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ color: "#5a6478", fontSize: "0.7rem", fontFamily: "JetBrains Mono, monospace" }}>
                  editor.md
                </span>
                <span style={{ marginLeft: "auto", color: "#1e2430", fontSize: "0.65rem", fontFamily: "JetBrains Mono, monospace" }}>
                  {content.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# My Note&#10;&#10;Start writing in **markdown**...&#10;&#10;```bash&#10;nmap -sV target.com&#10;```"
                required
                rows={24}
                style={{
                  flex: 1,
                  background: "#0d1014",
                  border: "1px solid #1e2430",
                  borderTop: "none",
                  color: "#e0e0e0",
                  fontFamily: "Fira Code, JetBrains Mono, monospace",
                  fontSize: "0.83rem",
                  lineHeight: 1.7,
                  padding: "1rem",
                  outline: "none",
                  resize: "vertical",
                  minHeight: "400px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#00ff9d";
                  e.target.style.boxShadow = "0 0 0 1px rgba(0,255,157,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#1e2430";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Preview */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  background: "#111318",
                  border: "1px solid #1e2430",
                  padding: "0.4rem 0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ color: "#5a6478", fontSize: "0.7rem", fontFamily: "JetBrains Mono, monospace" }}>
                  preview
                </span>
                <span style={{ marginLeft: "auto", color: "#00ff9d", fontSize: "0.65rem", fontFamily: "JetBrains Mono, monospace" }}>
                  ● live
                </span>
              </div>
              <div
                style={{
                  flex: 1,
                  background: "#111318",
                  border: "1px solid #1e2430",
                  borderTop: "none",
                  padding: "1rem",
                  overflowY: "auto",
                  minHeight: "400px",
                }}
              >
                <MarkdownPreview content={content} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
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
