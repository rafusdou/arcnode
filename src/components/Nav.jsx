import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import Logo from "./Logo.jsx";

const LangPicker = ({ value, onChange }) => (
  <div className="lang-picker" role="group" aria-label="Language">
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
        <Link to="/#planes">{t.nav.prices}</Link>
        <Link to="/#features">{t.nav.includes}</Link>
        <Link to="/#faq">{t.nav.faq}</Link>
      </div>
      <div className="nav-actions">
        <LangPicker value={lang} onChange={setLang} />
        <CurrencyPicker value={currency} onChange={setCurrency} />
        <Link className="btn btn-ghost" to="/login">{t.nav.login}</Link>
        <Link className="btn btn-primary" to="/#calc">{t.nav.cta}</Link>
      </div>
    </nav>
  );
}
