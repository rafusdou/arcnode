import { Link } from "react-router-dom";

export default function Logo({ size = 26, showText = true }) {
  return (
    <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M6 22 Q 16 4, 26 22" stroke="#378ADD" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle cx="6" cy="22" r="3.4" fill="#378ADD" />
        <circle cx="16" cy="12" r="3" fill="#5DCAA5" />
        <circle cx="26" cy="22" r="3.4" fill="#1D9E75" />
      </svg>
      {showText && (
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: "var(--text-strong)" }}>
          ArcNode<span style={{ color: "var(--muted)", fontWeight: 500 }}>.cc</span>
        </span>
      )}
    </Link>
  );
}
