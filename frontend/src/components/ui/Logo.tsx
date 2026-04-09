/**
 * Logo component — renders your PNG logo when available,
 * falls back to a clean text wordmark if not.
 *
 * Usage:
 *   <Logo height={32} />
 *   <Logo height={28} textOnly />
 *
 * To use your PNG: place it at src/assets/logo.png
 * Then uncomment the import below.
 */

// import logoSrc from "@assets/logo.png";
const logoSrc: string | null = null; // ← replace null with the import above once you have logo.png

interface LogoProps {
  height?: number;
  textOnly?: boolean;
  dark?: boolean; // true = white text (for dark backgrounds)
}

export default function Logo({ height = 32, textOnly = false, dark = false }: LogoProps) {
  const textColor = dark ? "#ffffff" : "#0f172a";

  if (!textOnly && logoSrc) {
    return (
      <img
        src={logoSrc}
        alt="UniLease"
        style={{ height, width: "auto", display: "block" }}
      />
    );
  }

  // Fallback wordmark
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, height }}>
      {/* Icon mark */}
      <div style={{
        width: height,
        height: height,
        borderRadius: Math.round(height * 0.28),
        background: "#3b5bfc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <svg width={height * 0.55} height={height * 0.55} viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>
        </svg>
      </div>
      {/* Wordmark */}
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: Math.round(height * 0.56),
        color: textColor,
        letterSpacing: "-0.01em",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}>
        UniLease
      </span>
    </div>
  );
}
