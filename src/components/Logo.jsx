import { Link } from "react-router-dom";

export default function Logo({ size = 28, showText = true }) {
  return (
    <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="arc-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#378ADD" />
            <stop offset="1" stopColor="#1D9E75" />
          </linearGradient>
        </defs>
        <path d="M6 22 Q 16 4, 26 22" stroke="url(#arc-grad)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M6 22 Q 16 30, 26 22" stroke="#5DCAA5" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.55" />
        <circle cx="6" cy="22" r="3.4" fill="#378ADD" />
        <circle cx="16" cy="6" r="3" fill="#5DCAA5" />
        <circle cx="26" cy="22" r="3.4" fill="#1D9E75" />
      </svg>
      {showText && (
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: -0.2, color: "var(--text)" }}>
          Arc<span style={{ color: "var(--green)" }}>Node</span>
          <span style={{ color: "var(--muted)", fontWeight: 600 }}>.cc</span>
        </span>
      )}
    </Link>
  );
}
