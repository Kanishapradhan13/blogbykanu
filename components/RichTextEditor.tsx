"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TiptapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import { createLowlight, common } from "lowlight";
import { useState, useCallback, useRef, useEffect } from "react";
import { getImageUploadUrl } from "@/app/actions/upload-image";

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string; // HTML
  onChange: (html: string) => void;
}

function Sep() {
  return <div style={{ width: 1, height: 18, background: "#2e1f4a", margin: "0 0.2rem", flexShrink: 0 }} />;
}

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
  disabled,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: active ? "rgba(196,181,253,0.15)" : "transparent",
        border: `1px solid ${active ? "#c4b5fd" : "#2e1f4a"}`,
        color: active ? "#c4b5fd" : "#9d8bc4",
        fontFamily: "var(--font-sans)",
        fontSize: "0.72rem",
        padding: "0.2rem 0.45rem",
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: "4px",
        minWidth: "28px",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#c4b5fd";
          (e.currentTarget as HTMLButtonElement).style.color = "#c4b5fd";
        }
      }}
      onMouseLeave={(e) => {
        if (!active && !disabled) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#2e1f4a";
          (e.currentTarget as HTMLButtonElement).style.color = "#9d8bc4";
        }
      }}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const insertImageRef = useRef<((file: File) => Promise<void>) | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      CodeBlockLowlight.configure({ lowlight }),
      TiptapImage.configure({ inline: false }),
      Placeholder.configure({ placeholder: "Start writing your note..." }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: { class: "rich-editor-content" },
      handlePaste: (_view, event) => {
        const items = Array.from(event.clipboardData?.items ?? []);
        const imageItem = items.find((item) => item.type.startsWith("image/"));
        if (!imageItem) return false;

        event.preventDefault();
        const file = imageItem.getAsFile();
        if (!file) return true;

        const ext = imageItem.type.split("/")[1] ?? "png";
        const namedFile = new File([file], `pasted-image.${ext}`, { type: imageItem.type });
        insertImageRef.current?.(namedFile);
        return true;
      },
    },
    immediatelyRender: false,
  });

  // Sync content on first mount only
  const initialised = useRef(false);
  useEffect(() => {
    if (editor && !initialised.current && content) {
      editor.commands.setContent(content, { emitUpdate: false });
      initialised.current = true;
    }
  }, [editor, content]);

  const insertImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      setUploadError(null);

      if (!file.type.startsWith("image/")) { setUploadError("Only image files are allowed"); return; }
      if (file.size > 5 * 1024 * 1024) { setUploadError("Image must be under 5 MB"); return; }

      setUploading(true);
      try {
        const { signedUrl, publicUrl } = await getImageUploadUrl(file.name);
        const res = await fetch(signedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
        editor.chain().focus().setImage({ src: publicUrl, alt: file.name.replace(/\.[^.]+$/, "") }).run();
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  useEffect(() => { insertImageRef.current = insertImage; });

  if (!editor) return null;

  const inTable = editor.isActive("table");
  const wordCount = editor.getText().trim().split(/\s+/).filter(Boolean).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", border: "1px solid #2e1f4a", borderRadius: "6px", overflow: "hidden" }}>
      {/* ── Toolbar ── */}
      <div style={{
        background: "#1a1228",
        borderBottom: "1px solid #2e1f4a",
        padding: "0.4rem 0.75rem",
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.25rem",
      }}>
        {/* Text style */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (⌘B)"><strong>B</strong></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (⌘I)"><em>I</em></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (⌘U)"><u>U</u></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><s>S</s></ToolbarBtn>

        <Sep />

        {/* Headings */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">H1</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">H2</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">H3</ToolbarBtn>

        <Sep />

        {/* Lists */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">• list</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">1. list</ToolbarBtn>

        <Sep />

        {/* Code */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code">`code`</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">``` block</ToolbarBtn>

        <Sep />

        {/* Block elements */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">&ldquo;quote&rdquo;</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal rule">——</ToolbarBtn>

        <Sep />

        {/* Table */}
        {!inTable ? (
          <ToolbarBtn
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            active={false}
            title="Insert table (3×3)"
          >
            ⊞ table
          </ToolbarBtn>
        ) : (
          <>
            <ToolbarBtn onClick={() => editor.chain().focus().addColumnAfter().run()} active={false} title="Add column after">+col</ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().deleteColumn().run()} active={false} title="Delete column">-col</ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().addRowAfter().run()} active={false} title="Add row after">+row</ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().deleteRow().run()} active={false} title="Delete row">-row</ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().deleteTable().run()} active={false} title="Delete table">✕ table</ToolbarBtn>
          </>
        )}

        <Sep />

        {/* Image */}
        <ToolbarBtn onClick={() => fileInputRef.current?.click()} active={false} title="Insert image" disabled={uploading}>
          {uploading ? "uploading..." : "⊕ image"}
        </ToolbarBtn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            await insertImage(file);
            e.target.value = "";
          }}
        />

        <span style={{ marginLeft: "auto", color: "#3d2f5a", fontSize: "0.65rem", fontFamily: "var(--font-sans)", flexShrink: 0 }}>
          {wordCount} words
        </span>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderTop: "none", color: "#fca5a5", fontFamily: "var(--font-sans)", fontSize: "0.7rem", padding: "0.3rem 0.75rem" }}>
          {uploadError}
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
