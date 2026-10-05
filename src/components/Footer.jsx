import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import Logo from "./Logo.jsx";

export default function Footer() {
  const { t } = useApp();
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Logo />
          <div className="footer-tagline">{t.footer.tagline}</div>
          <p>{t.footer.blurb}</p>
          <div className="socials">
            {["discord", "twitter", "github", "youtube"].map((s) => (
              <a key={s} className="social" href="#" aria-label={s}>{s[0].toUpperCase()}</a>
            ))}
          </div>
        </div>
        {t.footer.cols.map((c, i) => (
          <div key={i}>
            <h4>{c.h}</h4>
            {c.links.map((link) => <Link key={link.to} to={link.to}>{link.l}</Link>)}
          </div>
        ))}
      </div>
      <div className="footer-bot">
        <span>{t.footer.copy}</span>
        <span>{t.footer.disclaimer}</span>
      </div>
    </footer>
  );
}
