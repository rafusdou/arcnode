import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import Logo from "./Logo.jsx";

const LangPicker = ({ value, onChange }) => (
  <div className="lang-picker" role="group" aria-label="Language">
    <svg className="lang-globe" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
    </svg>
    {["es", "en"].map((o) => (
      <button key={o} className={"lang-opt " + (value === o ? "active" : "")} onClick={() => onChange(o)}>
        {o.toUpperCase()}
      </button>
    ))}
  </div>
);

const CurrencyPicker = ({ value, onChange }) => (
  <div className="cur-picker">
    {["ARS", "USD", "EUR"].map((o) => (
      <button key={o} className={"cur-opt " + (value === o ? "active" : "")} onClick={() => onChange(o)}>{o}</button>
    ))}
  </div>
);

export default function Nav() {
  const { lang, setLang, currency, setCurrency, t } = useApp();
  return (
    <nav className="nav">
      <Logo />
      <div className="nav-links">
        <Link to="/#planes">{t.nav.plans}</Link>
        <Link to="/#features">{t.nav.features}</Link>
        <Link to="/#calc">{t.nav.calc}</Link>
        <Link to="/#testimonios">{t.nav.testis}</Link>
      </div>
      <div className="nav-actions">
        <LangPicker value={lang} onChange={setLang} />
        <CurrencyPicker value={currency} onChange={setCurrency} />
        <Link className="btn btn-ghost" to="/login">{t.nav.login}</Link>
        <Link className="btn btn-primary" to="/signup">{t.nav.cta}</Link>
      </div>
    </nav>
  );
}
