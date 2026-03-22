import type { Category } from "@/lib/notes";

const CATEGORY_STYLES: Record<string, { color: string; glow: string; label: string }> = {
  Recon:                { color: "#c4b5fd", glow: "rgba(196,181,253,0.25)", label: "RECON" },
  "Web Exploitation":   { color: "#f0abfc", glow: "rgba(240,171,252,0.25)", label: "WEB EXPLOIT" },
  "Privilege Escalation": { color: "#fb7185", glow: "rgba(251,113,133,0.25)", label: "PRIVESC" },
  Forensics:            { color: "#fde68a", glow: "rgba(253,230,138,0.25)", label: "FORENSICS" },
  OSINT:                { color: "#a78bfa", glow: "rgba(167,139,250,0.25)", label: "OSINT" },
  "CTF Writeup":        { color: "#f9a8d4", glow: "rgba(249,168,212,0.25)", label: "CTF WRITEUP" },
  Tools:                { color: "#c4b5fd", glow: "rgba(196,181,253,0.25)", label: "TOOLS" },
  General:              { color: "#7c6a9e", glow: "rgba(124,106,158,0.25)", label: "GENERAL" },
};

export default function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.General;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.2rem 0.6rem",
        fontSize: "0.65rem",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        letterSpacing: "0.1em",
        color: style.color,
        border: `1px solid ${style.color}60`,
        background: `${style.color}18`,
        boxShadow: `0 0 8px ${style.glow}`,
        borderRadius: "4px",
        whiteSpace: "nowrap",
      }}
    >
      {style.label}
    </span>
  );
}
