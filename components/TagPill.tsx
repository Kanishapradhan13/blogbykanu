export default function TagPill({ tag }: { tag: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.15rem 0.5rem",
        fontSize: "0.65rem",
        fontFamily: "JetBrains Mono, monospace",
        color: "#7c6a9e",
        border: "1px solid #2e1f4a",
        background: "#221836",
        whiteSpace: "nowrap",
        borderRadius: "4px",
      }}
    >
      #{tag}
    </span>
  );
}
