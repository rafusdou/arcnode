import { Link } from "react-router-dom";

// Isometric block with a "+" on top: the block "de más", the changüí.
export function LogoMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 3 L28 9.5 L16 16 L4 9.5 Z" fill="#FFD266" />
      <path d="M4 9.5 L16 16 L16 29 L4 22.5 Z" fill="#F2B33D" />
      <path d="M16 16 L28 9.5 L28 22.5 L16 29 Z" fill="#C98C14" />
      <path d="M16 6.4 V12.6 M12.2 9.5 H19.8" stroke="#5A3D00" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ size = 26, showText = true }) {
  return (
    <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
      <LogoMark size={size} />
      {showText && (
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.03em", color: "var(--text-strong)" }}>
          Changui<span style={{ color: "var(--accent)" }}>host</span>
        </span>
      )}
    </Link>
  );
}
