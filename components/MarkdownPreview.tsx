"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef } from "react";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Add copy buttons to all code blocks after render
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pres = container.querySelectorAll("pre");
    pres.forEach((pre) => {
      if (pre.querySelector(".code-copy-btn")) return;

      // Wrap in relative container if not already
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
          setTimeout(() => {
            btn.textContent = "copy";
            btn.style.color = "";
            btn.style.borderColor = "";
          }, 2000);
        } catch {
          btn.textContent = "error";
        }
      };
      pre.appendChild(btn);
    });
  });

  return (
    <div ref={containerRef} className={`markdown-content ${className ?? ""}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content || "_Nothing to preview yet..._"}
      </ReactMarkdown>
    </div>
  );
}
