"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface DeleteButtonProps {
  noteId: string;
  deleteAction: (id: string) => Promise<void>;
}

export default function DeleteButton({ noteId, deleteAction }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteAction(noteId);
      toast.success("Note deleted.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Failed to delete note.");
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ color: "#fb7185", fontFamily: "JetBrains Mono, monospace", fontSize: "0.8rem" }}>
          delete this note?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{
            padding: "0.4rem 0.8rem",
            fontSize: "0.75rem",
            border: "1px solid #fb7185",
            color: "#fb7185",
            background: "rgba(251,113,133,0.08)",
            fontFamily: "JetBrains Mono, monospace",
            cursor: "pointer",
            borderRadius: "6px",
          }}
        >
          {loading ? "deleting..." : "yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          style={{
            background: "transparent",
            border: "1px solid #2e1f4a",
            color: "#7c6a9e",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.75rem",
            padding: "0.4rem 0.8rem",
            cursor: "pointer",
            borderRadius: "6px",
          }}
        >
          cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.4rem 0.9rem",
        border: "1px solid rgba(251,113,133,0.4)",
        color: "#fb7185",
        background: "rgba(251,113,133,0.06)",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "0.75rem",
        cursor: "pointer",
        borderRadius: "6px",
        transition: "all 0.2s",
      }}
    >
      🗑 delete
    </button>
  );
}
