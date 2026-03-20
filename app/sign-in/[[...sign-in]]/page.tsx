import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0b1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(196,181,253,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-5%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(240,171,252,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "1.6rem",
              color: "#c4b5fd",
              fontWeight: 700,
              textShadow: "0 0 20px rgba(196,181,253,0.4)",
            }}
          >
            ✦ CyberNotes
          </p>
          <p
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.8rem",
              color: "#7c6a9e",
              marginTop: "0.5rem",
            }}
          >
            welcome back — sign in to your notes
          </p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
