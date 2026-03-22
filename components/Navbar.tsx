"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import MatrixRain from "./MatrixRain";

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <>
      <MatrixRain />
      <nav
        style={{
          background: "rgba(15, 11, 26, 0.95)",
          borderBottom: "1px solid #2e1f4a",
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 1.5rem",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
            }}
          >
            <span style={{ color: "#c4b5fd", fontSize: "1.1rem" }}>✦</span>
            <span
              style={{
                color: "#c4b5fd",
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                fontSize: "1rem",
                textShadow: "0 0 10px rgba(196,181,253,0.4)",
                letterSpacing: "0.05em",
              }}
            >
              BLOG<span style={{ color: "#f0abfc" }}>BYKANU</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            {isLoaded && isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  style={{
                    color: pathname === "/dashboard" ? "#c4b5fd" : "#7c6a9e",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    textDecoration: "none",
                    transition: "color 0.2s",
                    textShadow:
                      pathname === "/dashboard" ? "0 0 8px rgba(196,181,253,0.4)" : "none",
                  }}
                >
                  /dashboard
                </Link>
                <Link
                  href="/notes/new"
                  style={{
                    color: pathname === "/notes/new" ? "#c4b5fd" : "#7c6a9e",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    textDecoration: "none",
                    transition: "color 0.2s",
                    textShadow:
                      pathname === "/notes/new" ? "0 0 8px rgba(196,181,253,0.4)" : "none",
                  }}
                >
                  /new-note
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: {
                        width: "32px",
                        height: "32px",
                        border: "1px solid #2e1f4a",
                      },
                    },
                  }}
                />
              </>
            ) : isLoaded ? (
              <>
                <Link
                  href="/sign-in"
                  className="btn-neon-cyan btn-neon"
                  style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}
                >
                  sign_in
                </Link>
                <Link
                  href="/sign-up"
                  className="btn-solid-green btn-neon"
                  style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}
                >
                  sign_up
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </nav>
    </>
  );
}
