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
          <p>{t.footer.blurb}</p>
        </div>
        {t.footer.cols.map((c) => (
          <div key={c.h}>
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
