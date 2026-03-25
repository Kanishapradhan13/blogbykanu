"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useFormStatus } from "react-dom";
import dynamic from "next/dynamic";
import type { Note } from "@/lib/notes";
import CategoryBadge from "./CategoryBadge";
import { uploadImageAction } from "@/app/actions/upload-image";

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const insertImageAtCursor = useCallback(async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await uploadImageAction(fd);

      const textarea = textareaRef.current;
      const altText = file.name.replace(/\.[^.]+$/, "") || "image";
      const mdImage = `![${altText}](${url})`;

      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.slice(0, start) + mdImage + content.slice(end);
        setContent(newContent);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + mdImage.length;
          textarea.focus();
        }, 0);
      } else {
        setContent((prev) => prev + "\n" + mdImage);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [content]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await insertImageAtCursor(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [insertImageAtCursor]);

  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith("image/"));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;
    // Give it a name since pasted images don't have one
    const ext = imageItem.type.split("/")[1] ?? "png";
    const namedFile = new File([file], `pasted-image.${ext}`, { type: imageItem.type });
    await insertImageAtCursor(namedFile);
  }, [insertImageAtCursor]);

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
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    title="Insert image"
                    style={{
                      background: "transparent",
                      border: "1px solid #2e1f4a",
                      color: uploading ? "#3d2f5a" : "#7c6a9e",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.65rem",
                      padding: "0.2rem 0.5rem",
                      cursor: uploading ? "not-allowed" : "pointer",
                      borderRadius: "4px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!uploading) {
                        (e.target as HTMLButtonElement).style.borderColor = "#c4b5fd";
                        (e.target as HTMLButtonElement).style.color = "#c4b5fd";
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.borderColor = "#2e1f4a";
                      (e.target as HTMLButtonElement).style.color = uploading ? "#3d2f5a" : "#7c6a9e";
                    }}
                  >
                    {uploading ? "uploading..." : "insert image"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                  <span style={{ color: "#3d2f5a", fontSize: "0.65rem", fontFamily: "var(--font-sans)" }}>
                    {content.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
              </div>
              {uploadError && (
                <div style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#fca5a5",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.7rem",
                  padding: "0.3rem 0.75rem",
                }}>
                  {uploadError}
                </div>
              )}
              <textarea
                ref={textareaRef}
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
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
