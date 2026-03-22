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
    category: "DBMS",
    title: "Database Normalization — 1NF to BCNF",
    excerpt: "Normalization removes redundancy. 1NF: atomic values. 2NF: no partial deps. 3NF: no transitive deps...",
    tags: ["dbms", "normalization", "relational"],
    content: `## Database Normalization — 1NF to BCNF

Normalization is the process of organizing a relational database to reduce redundancy and improve data integrity.

---

### 1NF — First Normal Form
- Each column holds **atomic** (indivisible) values
- No repeating groups or arrays in a column

**Violation:**
| StudentID | Courses         |
|-----------|-----------------|
| 1         | Math, Science   |

**Fixed:** split into separate rows — one course per row.

---

### 2NF — Second Normal Form
- Must be in 1NF
- **No partial dependency** — every non-key attribute depends on the *whole* primary key (applies to composite keys)

**Example fix:** If (StudentID, CourseID) is the PK but CourseName depends only on CourseID → move CourseName to a separate Courses table.

---

### 3NF — Third Normal Form
- Must be in 2NF
- **No transitive dependency** — non-key attributes must not depend on other non-key attributes

**Violation:** ZipCode → City (ZipCode is not a key)
**Fix:** Extract a ZipCodes(ZipCode, City) table.

---

### BCNF — Boyce-Codd Normal Form
- Stricter version of 3NF
- For every functional dependency X → Y, X must be a **superkey**

### Quick Reference
\`\`\`
1NF → atomic values
2NF → no partial deps on composite PK
3NF → no transitive deps
BCNF → every determinant is a superkey
\`\`\``,
  },
  {
    id: "2",
    category: "SQL",
    title: "SQL Joins & Aggregations Cheat Sheet",
    excerpt: "INNER JOIN returns matching rows. LEFT JOIN keeps all left rows. GROUP BY + HAVING for aggregates...",
    tags: ["sql", "joins", "queries"],
    content: `## SQL Joins & Aggregations Cheat Sheet

---

### Types of JOINs

\`\`\`sql
-- INNER JOIN: only matching rows
SELECT e.name, d.dept_name
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;

-- LEFT JOIN: all rows from left, NULLs for no match on right
SELECT e.name, d.dept_name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;

-- SELF JOIN: join a table with itself
SELECT a.name AS employee, b.name AS manager
FROM employees a
JOIN employees b ON a.manager_id = b.id;
\`\`\`

---

### Aggregations

\`\`\`sql
-- GROUP BY with aggregate functions
SELECT dept_id, COUNT(*) AS headcount, AVG(salary) AS avg_sal
FROM employees
GROUP BY dept_id;

-- HAVING: filter after aggregation (unlike WHERE which filters before)
SELECT dept_id, COUNT(*) AS headcount
FROM employees
GROUP BY dept_id
HAVING COUNT(*) > 5;
\`\`\`

---

### Subqueries & CTEs

\`\`\`sql
-- Correlated subquery
SELECT name FROM employees e
WHERE salary > (SELECT AVG(salary) FROM employees WHERE dept_id = e.dept_id);

-- CTE (Common Table Expression)
WITH top_earners AS (
  SELECT * FROM employees WHERE salary > 80000
)
SELECT name, dept_id FROM top_earners ORDER BY salary DESC;
\`\`\`

---

### Window Functions

\`\`\`sql
SELECT name, salary,
  RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank_in_dept
FROM employees;
\`\`\``,
  },
  {
    id: "3",
    category: "System Design",
    title: "Designing Scalable Systems — Core Concepts",
    excerpt: "CAP theorem: you can only guarantee 2 of 3 — Consistency, Availability, Partition tolerance...",
    tags: ["system-design", "scalability", "architecture"],
    content: `## Designing Scalable Systems — Core Concepts

---

### CAP Theorem
A distributed system can only guarantee **2 of 3**:
- **C**onsistency — every read gets the latest write
- **A**vailability — every request gets a response
- **P**artition tolerance — system works despite network splits

Most real systems choose **AP** (eventual consistency) or **CP** (strong consistency).

---

### Horizontal vs Vertical Scaling
| | Vertical | Horizontal |
|---|---|---|
| How | Bigger machine | More machines |
| Limit | Hardware ceiling | Near-infinite |
| Cost | Expensive | Commodity hardware |

---

### Caching Strategies
\`\`\`
Cache-aside (lazy loading):
  1. Check cache → hit? return it
  2. Miss → query DB → store in cache → return

Write-through:
  Write to cache AND DB simultaneously — always consistent

Write-back:
  Write to cache only → async flush to DB — fast but risky
\`\`\`

---

### Load Balancing Algorithms
- **Round Robin** — requests distributed evenly in order
- **Least Connections** — send to server with fewest active connections
- **IP Hash** — same client always hits same server (useful for sessions)

---

### Database Sharding
Split data across multiple DB instances by a **shard key**:
\`\`\`
User IDs 1–1M   → Shard A
User IDs 1M–2M  → Shard B
\`\`\`
Watch out for **hot shards** if the key isn't distributed evenly.`,
  },
  {
    id: "4",
    category: "DSA",
    title: "Big O & Essential Data Structures",
    excerpt: "O(1) constant, O(log n) binary search, O(n) linear scan. Hash maps give O(1) avg lookup...",
    tags: ["dsa", "algorithms", "complexity"],
    content: `## Big O & Essential Data Structures

---

### Big O Complexity — Quick Reference
| Complexity | Name | Example |
|---|---|---|
| O(1) | Constant | Hash map lookup |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Array scan |
| O(n log n) | Linearithmic | Merge sort |
| O(n²) | Quadratic | Bubble sort |
| O(2ⁿ) | Exponential | Recursive subsets |

---

### Arrays vs Linked Lists
\`\`\`
Array:
  Access: O(1)   Insert/Delete (mid): O(n)   Cache-friendly ✓

Linked List:
  Access: O(n)   Insert/Delete (head): O(1)   No random access ✗
\`\`\`

---

### Hash Maps
- Average: O(1) insert, delete, lookup
- Worst case (collisions): O(n)
- Python: \`dict\`, Java: \`HashMap\`, JS: \`Map\`

\`\`\`python
# Two Sum using hash map — O(n)
def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i
\`\`\`

---

### Trees
- **BST** — O(log n) search/insert when balanced
- **Heap** — O(1) peek max/min, O(log n) insert — used for priority queues
- **Trie** — prefix lookups in O(L) where L = word length

---

### Sorting Algorithms
| Algorithm | Best | Average | Worst | Space |
|---|---|---|---|---|
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) |`,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  DBMS: "#c4b5fd",
  SQL: "#f9a8d4",
  "System Design": "#f0abfc",
  DSA: "#fde68a",
  Backend: "#a78bfa",
  Frontend: "#fb7185",
  DevOps: "#e9d5ff",
  General: "#ddd6fe",
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
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              letterSpacing: "0.08em",
              marginBottom: "0.6rem",
            }}>
              {note.category.toUpperCase()}
            </span>
            <h2 style={{
              fontFamily: "var(--font-sans)",
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
                  fontFamily: "var(--font-sans)",
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
            fontFamily: "var(--font-sans)",
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
          <span style={{ fontSize: "0.68rem", color: "#3d2f5a", fontFamily: "var(--font-sans)" }}>
            sample note — sign in to create your own
          </span>
          <Link href="/sign-up" style={{
            padding: "0.45rem 1rem",
            background: "#c4b5fd",
            color: "#0f0b1a",
            fontFamily: "var(--font-sans)",
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
              ⚡ learn. build. ship.
            </div>

            <h1 style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#ede9fe",
              marginBottom: "1.5rem",
            }}>
              Your notes,{" "}
              <span style={{ color: "#c4b5fd", textShadow: "0 0 28px rgba(196,181,253,0.5)" }}>
                organized
              </span>
              <br />&amp; always searchable.
            </h1>

            <p style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.92rem",
              color: "#7c6a9e",
              lineHeight: 1.9,
              marginBottom: "2.5rem",
            }}>
              Document your learnings, deep-dives &amp; tech notes.
              <br />Tagged, searchable, and locked behind your login —
              <br />because good knowledge deserves a proper home.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/notes/new" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.8rem 1.8rem",
                background: "#c4b5fd",
                color: "#0f0b1a",
                fontFamily: "var(--font-sans)",
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
                  fontFamily: "var(--font-sans)",
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
              fontFamily: "var(--font-sans)",
              letterSpacing: "0.08em",
            }}>
              if it's not written down, you'll forget it. — kanisha ✦
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
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.7rem",
                  color: "#7c6a9e",
                }}>
                  ✦ blogbykanu / notes
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
                  <span style={{ color: "#7c6a9e", fontSize: "0.75rem", fontFamily: "var(--font-sans)" }}>/search</span>
                  <span style={{ color: "#3d2f5a", fontSize: "0.75rem", fontFamily: "var(--font-sans)", flex: 1 }}>search notes...</span>
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
                        fontFamily: "var(--font-sans)",
                        marginBottom: "0.6rem",
                        letterSpacing: "0.04em",
                      }}>
                        {note.category}
                      </div>
                      <p style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#ede9fe",
                        marginBottom: "0.4rem",
                        lineHeight: 1.4,
                      }}>
                        {note.title}
                      </p>
                      <p style={{
                        fontFamily: "var(--font-sans)",
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
                            fontFamily: "var(--font-sans)",
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
              fontFamily: "var(--font-sans)",
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
        fontFamily: "var(--font-sans)",
        fontSize: "0.72rem",
      }}>
        <span style={{ color: "#c4b5fd", opacity: 0.6 }}>✦</span> by kanisha &nbsp;·&nbsp; <span style={{ fontStyle: "italic" }}>"write it down before you forget it"</span>
      </footer>
    </div>
  );
}
