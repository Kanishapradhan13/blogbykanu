"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef, useState } from "react";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

function isHtml(content: string) {
  return content.trim().startsWith("<");
}

// Sanitise HTML on the client to prevent XSS (public notes can be seen by anyone)
function useSanitised(html: string) {
  const [safe, setSafe] = useState<string>("");
  useEffect(() => {
    import("dompurify").then(({ default: DOMPurify }) => {
      setSafe(DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }));
    });
  }, [html]);
  return safe;
}

function HtmlContent({ content, className }: { content: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const safe = useSanitised(content);

  // Add copy buttons to code blocks
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !safe) return;
    const pres = container.querySelectorAll("pre");
    pres.forEach((pre) => {
      if (pre.querySelector(".code-copy-btn")) return;
      if (!pre.parentElement?.classList.contains("code-block-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.className = "code-block-wrapper";
        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
      }
      const btn = document.createElement("button");
      btn.className = "code-copy-btn";
      btn.textContent = "copy";
      btn.onclick = async () => {
        const code = pre.querySelector("code")?.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          btn.textContent = "copied!";
          btn.style.color = "#00ff9d";
          btn.style.borderColor = "#00ff9d";
          setTimeout(() => { btn.textContent = "copy"; btn.style.color = ""; btn.style.borderColor = ""; }, 2000);
        } catch { btn.textContent = "error"; }
      };
      pre.appendChild(btn);
    });
  }, [safe]);

  if (!safe) return null;

  return (
    <div
      ref={containerRef}
      className={`markdown-content ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

export default function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Copy buttons for markdown-rendered code blocks
  useEffect(() => {
    if (isHtml(content)) return;
    const container = containerRef.current;
    if (!container) return;
    const pres = container.querySelectorAll("pre");
    pres.forEach((pre) => {
      if (pre.querySelector(".code-copy-btn")) return;
      if (!pre.parentElement?.classList.contains("code-block-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.className = "code-block-wrapper";
        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
      }
      const btn = document.createElement("button");
      btn.className = "code-copy-btn";
      btn.textContent = "copy";
      btn.onclick = async () => {
        const code = pre.querySelector("code")?.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          btn.textContent = "copied!";
          btn.style.color = "#00ff9d";
          btn.style.borderColor = "#00ff9d";
          setTimeout(() => { btn.textContent = "copy"; btn.style.color = ""; btn.style.borderColor = ""; }, 2000);
        } catch { btn.textContent = "error"; }
      };
      pre.appendChild(btn);
    });
  });

  if (isHtml(content)) {
    return <HtmlContent content={content} className={className} />;
  }

  return (
    <div ref={containerRef} className={`markdown-content ${className ?? ""}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content || "_Nothing here yet..._"}
      </ReactMarkdown>
    </div>
  );
}
