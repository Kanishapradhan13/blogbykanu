export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { type NextRequest } from "next/server";
import { getNoteById } from "@/lib/notes";
import {
  renderToBuffer,
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { marked, type Token, type Tokens } from "marked";
import React from "react";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 52,
    paddingBottom: 60,
    paddingHorizontal: 60,
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
  },
  title: { fontFamily: "Helvetica-Bold", fontSize: 22, marginBottom: 24, color: "#111111" },
  h1: { fontFamily: "Helvetica-Bold", fontSize: 17, marginTop: 16, marginBottom: 6, color: "#111111" },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 14, marginTop: 14, marginBottom: 5, color: "#222222" },
  h3: { fontFamily: "Helvetica-BoldOblique", fontSize: 12, marginTop: 12, marginBottom: 4, color: "#333333" },
  paragraph: { fontSize: 11, lineHeight: 1.75, marginBottom: 8, color: "#1a1a1a" },
  bold: { fontFamily: "Helvetica-Bold" },
  italic: { fontFamily: "Helvetica-Oblique" },
  inlineCode: { fontFamily: "Courier", fontSize: 10, backgroundColor: "#f0f0f0" },
  codeBlock: {
    fontFamily: "Courier",
    fontSize: 9.5,
    lineHeight: 1.55,
    backgroundColor: "#f6f6f6",
    borderLeftWidth: 3,
    borderLeftColor: "#cccccc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 8,
  },
  image: { width: "100%", marginVertical: 10, objectFit: "contain" },
  listItem: { flexDirection: "row", marginBottom: 4 },
  listBullet: { width: 18, fontSize: 11, color: "#555555" },
  listItemText: { flex: 1, fontSize: 11, lineHeight: 1.65, color: "#1a1a1a" },
  hr: { borderBottomWidth: 1, borderBottomColor: "#dddddd", marginVertical: 14 },
  blockView: { marginBottom: 2 },
});

// ── Markdown renderer (legacy notes) ─────────────────────────────────────

function renderInline(token: Token, key: number): React.ReactNode {
  switch (token.type) {
    case "strong": return <Text key={key} style={styles.bold}>{(token as Tokens.Strong).text}</Text>;
    case "em": return <Text key={key} style={styles.italic}>{(token as Tokens.Em).text}</Text>;
    case "codespan": return <Text key={key} style={styles.inlineCode}>{(token as Tokens.Codespan).text}</Text>;
    case "br": return "\n";
    case "link": return <Text key={key}>{(token as Tokens.Link).text}</Text>;
    case "del": return <Text key={key}>{(token as Tokens.Del).text}</Text>;
    case "text": return (token as Tokens.Text).text;
    case "escape": return (token as Tokens.Escape).text;
    default: return "raw" in token ? (token as { raw: string }).raw : "";
  }
}

function renderParagraphContent(tokens: Token[]): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let textBuffer: React.ReactNode[] = [];

  const flushText = () => {
    if (textBuffer.length > 0) {
      result.push(<Text key={result.length} style={styles.paragraph}>{textBuffer}</Text>);
      textBuffer = [];
    }
  };

  for (const t of tokens) {
    if (t.type === "image") {
      flushText();
      result.push(<Image key={result.length} src={(t as Tokens.Image).href} style={styles.image} />);
    } else {
      textBuffer.push(renderInline(t, textBuffer.length));
    }
  }
  flushText();
  return result;
}

function renderMarkdownToken(token: Token, index: number): React.ReactNode {
  switch (token.type) {
    case "heading": {
      const t = token as Tokens.Heading;
      const s = t.depth === 1 ? styles.h1 : t.depth === 2 ? styles.h2 : styles.h3;
      return <Text key={index} style={s}>{t.text}</Text>;
    }
    case "paragraph": {
      const t = token as Tokens.Paragraph;
      return <View key={index} style={styles.blockView}>{renderParagraphContent(t.tokens ?? [])}</View>;
    }
    case "code":
      return <Text key={index} style={styles.codeBlock}>{(token as Tokens.Code).text}</Text>;
    case "list": {
      const t = token as Tokens.List;
      return (
        <View key={index} style={styles.blockView}>
          {t.items.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.listBullet}>{t.ordered ? `${i + 1}.` : "•"}</Text>
              <Text style={styles.listItemText}>{item.text}</Text>
            </View>
          ))}
        </View>
      );
    }
    case "table": {
      const t = token as Tokens.Table;
      return (
        <View key={index} style={{ marginVertical: 8 }}>
          {/* Header row */}
          <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#cccccc" }}>
            {t.header.map((cell, ci) => (
              <Text key={ci} style={{ flex: 1, fontSize: 10, padding: 4, fontFamily: "Helvetica-Bold", backgroundColor: "#f0f0f0", color: "#111111", borderRightWidth: ci < t.header.length - 1 ? 1 : 0, borderRightColor: "#cccccc" }}>
                {cell.text}
              </Text>
            ))}
          </View>
          {/* Body rows */}
          {t.rows.map((row, ri) => (
            <View key={ri} style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eeeeee" }}>
              {row.map((cell, ci) => (
                <Text key={ci} style={{ flex: 1, fontSize: 10, padding: 4, fontFamily: "Helvetica", color: "#1a1a1a", borderRightWidth: ci < row.length - 1 ? 1 : 0, borderRightColor: "#eeeeee" }}>
                  {cell.text}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );
    }
    case "hr": return <View key={index} style={styles.hr} />;
    case "space": return null;
    default: return null;
  }
}

// ── HTML renderer (new rich-text notes) ──────────────────────────────────

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(s: string) {
  return decodeEntities(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

// Parse inline HTML into PDF Text nodes (bold / italic / code preserved)
function renderInlineHtml(html: string, key: number): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  let rest = html.replace(/<br\s*\/?>/gi, "\n");
  let plain = "";
  let idx = 0;

  const flushPlain = () => {
    if (plain) { nodes.push(decodeEntities(plain)); plain = ""; }
  };

  while (rest.length > 0) {
    let m: RegExpMatchArray | null;

    m = rest.match(/^<strong[^>]*>([\s\S]*?)<\/strong>/i);
    if (m) { flushPlain(); nodes.push(<Text key={idx++} style={styles.bold}>{stripTags(m[1])}</Text>); rest = rest.slice(m[0].length); continue; }

    m = rest.match(/^<em[^>]*>([\s\S]*?)<\/em>/i);
    if (m) { flushPlain(); nodes.push(<Text key={idx++} style={styles.italic}>{stripTags(m[1])}</Text>); rest = rest.slice(m[0].length); continue; }

    m = rest.match(/^<code[^>]*>([\s\S]*?)<\/code>/i);
    if (m) { flushPlain(); nodes.push(<Text key={idx++} style={styles.inlineCode}>{decodeEntities(m[1])}</Text>); rest = rest.slice(m[0].length); continue; }

    m = rest.match(/^<img[^>]*src="([^"]*)"[^>]*\/?>/i);
    if (m) { flushPlain(); nodes.push(<Image key={idx++} src={m[1]} style={styles.image} />); rest = rest.slice(m[0].length); continue; }

    m = rest.match(/^<[^>]+>/);
    if (m) { rest = rest.slice(m[0].length); continue; }

    plain += rest[0];
    rest = rest.slice(1);
  }
  flushPlain();

  return (
    <Text key={key} style={styles.paragraph}>
      {nodes.length > 0 ? nodes : decodeEntities(html.replace(/<[^>]+>/g, ""))}
    </Text>
  );
}

function renderHtmlContent(html: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let rest = html.replace(/\r\n/g, "\n").trim();
  let i = 0;

  while (rest.length > 0) {
    rest = rest.trimStart();
    if (!rest) break;
    let m: RegExpMatchArray | null;

    // Headings
    m = rest.match(/^<(h[1-3])[^>]*>([\s\S]*?)<\/h[1-3]>/i);
    if (m) {
      const level = m[1][1];
      const s = level === "1" ? styles.h1 : level === "2" ? styles.h2 : styles.h3;
      elements.push(<Text key={i++} style={s}>{stripTags(m[2])}</Text>);
      rest = rest.slice(m[0].length);
      continue;
    }

    // Code block: <pre><code...>...</code></pre>
    m = rest.match(/^<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/i);
    if (m) {
      elements.push(<Text key={i++} style={styles.codeBlock}>{decodeEntities(m[1])}</Text>);
      rest = rest.slice(m[0].length);
      continue;
    }

    // Table
    m = rest.match(/^<table[^>]*>([\s\S]*?)<\/table>/i);
    if (m) {
      const tableHtml = m[1];
      const rows = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
      elements.push(
        <View key={i++} style={{ marginVertical: 8 }}>
          {rows.map((row, ri) => {
            const isHeader = /<th[^>]*>/i.test(row[1]);
            const cells = [...row[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => stripTags(c[1]));
            return (
              <View key={ri} style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#cccccc" }}>
                {cells.map((cell, ci) => (
                  <Text key={ci} style={{
                    flex: 1,
                    fontSize: 10,
                    padding: 4,
                    borderRightWidth: ci < cells.length - 1 ? 1 : 0,
                    borderRightColor: "#cccccc",
                    fontFamily: isHeader ? "Helvetica-Bold" : "Helvetica",
                    backgroundColor: isHeader ? "#f0f0f0" : "#ffffff",
                    color: "#1a1a1a",
                  }}>
                    {cell}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
      );
      rest = rest.slice(m[0].length);
      continue;
    }

    // Unordered list
    m = rest.match(/^<ul[^>]*>([\s\S]*?)<\/ul>/i);
    if (m) {
      const items = [...m[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((li) => stripTags(li[1]));
      elements.push(
        <View key={i++} style={styles.blockView}>
          {items.map((text, j) => (
            <View key={j} style={styles.listItem}>
              <Text style={styles.listBullet}>•</Text>
              <Text style={styles.listItemText}>{text}</Text>
            </View>
          ))}
        </View>
      );
      rest = rest.slice(m[0].length);
      continue;
    }

    // Ordered list
    m = rest.match(/^<ol[^>]*>([\s\S]*?)<\/ol>/i);
    if (m) {
      const items = [...m[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((li) => stripTags(li[1]));
      elements.push(
        <View key={i++} style={styles.blockView}>
          {items.map((text, j) => (
            <View key={j} style={styles.listItem}>
              <Text style={styles.listBullet}>{j + 1}.</Text>
              <Text style={styles.listItemText}>{text}</Text>
            </View>
          ))}
        </View>
      );
      rest = rest.slice(m[0].length);
      continue;
    }

    // Blockquote
    m = rest.match(/^<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
    if (m) {
      elements.push(<Text key={i++} style={{ ...styles.paragraph, color: "#555555", fontFamily: "Helvetica-Oblique" }}>{stripTags(m[1])}</Text>);
      rest = rest.slice(m[0].length);
      continue;
    }

    // HR
    m = rest.match(/^<hr[^>]*\/?>/i);
    if (m) {
      elements.push(<View key={i++} style={styles.hr} />);
      rest = rest.slice(m[0].length);
      continue;
    }

    // Standalone image
    m = rest.match(/^<img[^>]*src="([^"]*)"[^>]*\/?>/i);
    if (m) {
      elements.push(<Image key={i++} src={m[1]} style={styles.image} />);
      rest = rest.slice(m[0].length);
      continue;
    }

    // Paragraph
    m = rest.match(/^<p[^>]*>([\s\S]*?)<\/p>/i);
    if (m) {
      const inner = m[1];
      // Image inside paragraph
      const imgM = inner.match(/<img[^>]*src="([^"]*)"[^>]*\/?>/i);
      if (imgM) {
        elements.push(<Image key={i++} src={imgM[1]} style={styles.image} />);
      } else {
        elements.push(
          <View key={i++} style={styles.blockView}>
            {renderInlineHtml(inner, i)}
          </View>
        );
      }
      rest = rest.slice(m[0].length);
      continue;
    }

    // Skip any unrecognised tag
    m = rest.match(/^<[^>]+>/);
    if (m) { rest = rest.slice(m[0].length); continue; }
    rest = rest.slice(1);
  }

  return elements;
}

// ── Route handler ─────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const note = await getNoteById(userId, id);
  if (!note) return new Response("Not found", { status: 404 });

  const isHtml = note.content.trim().startsWith("<");

  const contentElements = isHtml
    ? renderHtmlContent(note.content)
    : marked.lexer(note.content).map((token, i) => renderMarkdownToken(token, i));

  const pdf = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{note.title}</Text>
        {contentElements}
      </Page>
    </Document>
  );

  const buffer = await renderToBuffer(pdf);

  const filename = note.title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
    },
  });
}
