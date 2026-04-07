"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useFormStatus } from "react-dom";
import dynamic from "next/dynamic";
import { marked } from "marked";
import type { Note } from "@/lib/notes";
import CategoryBadge from "./CategoryBadge";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });

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
        : mode === "create" ? "create note ✦" : "save & close ✦"}
    </button>
  );
}

function toEditorHtml(content: string): string {
  if (!content) return "";
  if (content.trim().startsWith("<")) return content;
  return marked.parse(content) as string;
}

type EditorMode = "rich" | "markdown";

interface NoteFormProps {
  action: (formData: FormData) => Promise<void>;
  mode: "create" | "edit";
  note?: Note;
  autoSave?: (data: {
    title: string;
    content: string;
    category: string;
    tags: string;
  }) => Promise<{ ok: boolean; error?: string }>;
}

export default function NoteForm({ action, mode, note, autoSave }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(() => toEditorHtml(note?.content ?? ""));
  const [category, setCategory] = useState(note?.category ?? "General");
  const [tags, setTags] = useState(note?.tags?.join(", ") ?? "");

  const [editorMode, setEditorMode] = useState<EditorMode>("rich");
  // Incrementing this key forces the RichTextEditor to remount when switching back to rich mode
  const [richKey, setRichKey] = useState(0);
  const [converting, setConverting] = useState(false);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  // ── Mode switching ───────────────────────────────────────────────────────
  const switchMode = useCallback(
    async (newMode: EditorMode) => {
      if (newMode === editorMode || converting) return;
      setConverting(true);
      try {
        if (newMode === "markdown") {
          // HTML → Markdown (only convert if current content is HTML)
          if (content.trim().startsWith("<")) {
            const TurndownService = (await import("turndown")).default;
            const { gfm } = await import("turndown-plugin-gfm") as { gfm: (td: InstanceType<typeof TurndownService>) => void };
            const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" });
            td.use(gfm);
            // Preserve fenced code blocks with language
            td.addRule("fencedCodeBlock", {
              filter: (node) =>
                node.nodeName === "PRE" &&
                node.firstChild !== null &&
                (node.firstChild as Element).nodeName === "CODE",
              replacement: (_content, node) => {
                const code = node.firstChild as Element;
                const lang = (code.getAttribute("class") ?? "").replace("language-", "");
                return `\n\`\`\`${lang}\n${code.textContent ?? ""}\n\`\`\`\n`;
              },
            });
            setContent(td.turndown(content));
          }
          setEditorMode("markdown");
        } else {
          // Markdown → HTML (only convert if current content is markdown)
          if (!content.trim().startsWith("<")) {
            setContent(marked.parse(content) as string);
          }
          setRichKey((k) => k + 1); // remount editor with fresh content
          setEditorMode("rich");
        }
      } finally {
        setConverting(false);
      }
    },
    [editorMode, content, converting]
  );

  // ── Auto-save ────────────────────────────────────────────────────────────
  const triggerAutoSave = useCallback(() => {
    if (!autoSave) return;
    const snapshot = JSON.stringify({ title, content, category, tags });
    if (snapshot === lastSavedRef.current) return;
    setSaveStatus("saving");
    autoSave({ title, content, category, tags }).then(({ ok }) => {
      if (ok) {
        setSaveStatus("saved");
        lastSavedRef.current = snapshot;
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    });
  }, [autoSave, title, content, category, tags]);

  useEffect(() => {
    if (!autoSave) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(triggerAutoSave, 2000);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [title, content, category, tags, autoSave, triggerAutoSave]);

  // ── ⌘S to submit ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        const form = document.getElementById("note-form") as HTMLFormElement;
        if (form) form.requestSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "#0f0b1a", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ color: "#7c6a9e", fontFamily: "var(--font-sans)", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
              ✦ {mode === "create" ? "new note" : "edit note"}
            </p>
            <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.25rem", fontWeight: 700, color: "#ede9fe" }}>
              {mode === "create" ? "Create Note" : "Edit Note"}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            {/* Auto-save status */}
            {autoSave && (
              <span style={{
                fontFamily: "var(--font-sans)", fontSize: "0.7rem",
                color: saveStatus === "saved" ? "#00ff9d" : saveStatus === "saving" ? "#c4b5fd" : saveStatus === "error" ? "#fb7185" : "#3d2f5a",
                transition: "color 0.3s",
              }}>
                {saveStatus === "saved" ? "✓ autosaved" : saveStatus === "saving" ? "saving..." : saveStatus === "error" ? "save failed" : "autosave on"}
              </span>
            )}

            {/* Mode toggle */}
            <div style={{ display: "flex", border: "1px solid #2e1f4a", borderRadius: "5px", overflow: "hidden" }}>
              {(["rich", "markdown"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={converting}
                  onClick={() => switchMode(m)}
                  style={{
                    background: editorMode === m ? "rgba(196,181,253,0.12)" : "transparent",
                    border: "none",
                    borderRight: m === "rich" ? "1px solid #2e1f4a" : "none",
                    color: editorMode === m ? "#c4b5fd" : "#7c6a9e",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    padding: "0.3rem 0.75rem",
                    cursor: converting ? "wait" : "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {m === "rich" ? "✦ rich text" : "# markdown"}
                </button>
              ))}
            </div>

            <span style={{ color: "#3d2f5a", fontFamily: "var(--font-sans)", fontSize: "0.7rem" }}>⌘S to save & close</span>
          </div>
        </div>

        <form id="note-form" action={action}>
          {/* Hidden field carries content to the server action */}
          <input type="hidden" name="content" value={content} />

          {/* ── Title + Category ── */}
          <div className="title-category-row" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", marginBottom: "1rem", alignItems: "start" }}>
            <div>
              <label style={{ display: "block", color: "#7c6a9e", fontFamily: "var(--font-sans)", fontSize: "0.75rem", marginBottom: "0.4rem" }}>title</label>
              <input name="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title..." required className="input-terminal" style={{ fontSize: "1rem" }} />
            </div>
            <div>
              <label style={{ display: "block", color: "#7c6a9e", fontFamily: "var(--font-sans)", fontSize: "0.75rem", marginBottom: "0.4rem" }}>category</label>
              <input name="category" type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. DBMS, Backend, DSA..." className="input-terminal" style={{ minWidth: "180px" }} />
            </div>
          </div>

          {/* Category preview */}
          {category && <div style={{ marginBottom: "1rem" }}><CategoryBadge category={category} /></div>}

          {/* ── Tags ── */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", color: "#7c6a9e", fontFamily: "var(--font-sans)", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
              tags <span style={{ opacity: 0.5 }}>(comma-separated)</span>
            </label>
            <input name="tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="sql, system-design, react, algorithms..." className="input-terminal" />
          </div>

          {/* ── Editor ── */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "#7c6a9e", fontFamily: "var(--font-sans)", fontSize: "0.75rem", marginBottom: "0.4rem" }}>content</label>

            {editorMode === "rich" ? (
              <RichTextEditor key={richKey} content={content} onChange={setContent} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", border: "1px solid #2e1f4a", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ background: "#1a1228", borderBottom: "1px solid #2e1f4a", padding: "0.4rem 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: "#7c6a9e", fontSize: "0.7rem", fontFamily: "var(--font-sans)" }}>markdown</span>
                  <span style={{ marginLeft: "auto", color: "#3d2f5a", fontSize: "0.65rem", fontFamily: "var(--font-sans)" }}>
                    {content.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={"# My Note\n\nStart writing in **markdown**...\n\n```sql\nSELECT * FROM notes;\n```"}
                  rows={24}
                  style={{
                    background: "#130f20",
                    border: "none",
                    color: "#ede9fe",
                    fontFamily: "Fira Code, JetBrains Mono, monospace",
                    fontSize: "0.83rem",
                    lineHeight: 1.7,
                    padding: "1rem",
                    outline: "none",
                    resize: "vertical",
                    minHeight: "400px",
                    width: "100%",
                  }}
                  onPaste={async (e) => {
                    // Image paste in markdown mode too
                    const items = Array.from(e.clipboardData.items);
                    const imageItem = items.find((item) => item.type.startsWith("image/"));
                    if (!imageItem) return;
                    e.preventDefault();
                    const file = imageItem.getAsFile();
                    if (!file) return;
                    const { getImageUploadUrl } = await import("@/app/actions/upload-image");
                    const ext = imageItem.type.split("/")[1] ?? "png";
                    const namedFile = new File([file], `pasted-image.${ext}`, { type: imageItem.type });
                    try {
                      const { signedUrl, publicUrl } = await getImageUploadUrl(namedFile.name);
                      const res = await fetch(signedUrl, { method: "PUT", body: namedFile, headers: { "Content-Type": namedFile.type } });
                      if (!res.ok) return;
                      const altText = namedFile.name.replace(/\.[^.]+$/, "");
                      setContent((prev) => prev + `\n![${altText}](${publicUrl})\n`);
                    } catch { /* ignore */ }
                  }}
                />
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <SubmitButton mode={mode} />
            <a href={mode === "edit" && note ? `/notes/${note.id}` : "/dashboard"} className="btn-neon btn-neon-cyan" style={{ padding: "0.75rem 1.5rem", fontSize: "0.875rem" }}>
              cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
