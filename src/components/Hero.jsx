import { useApp } from "../context/AppContext.jsx";
import { PRICE_PER_GB, PRICE_PER_GB_ARS } from "../data/plans.js";
import { fmtPrice } from "../utils/currency.js";
import Configurator from "./Configurator.jsx";

export default function Hero({ ram, onRamChange }) {
  const { t, currency } = useApp();
  return (
    <section className="hero" id="calc">
      <div className="hero-inner">
        <div className="hero-copy">
          <h1 className="hero-title">
            {t.hero.titleBefore}
            <span className="hero-price">{fmtPrice(PRICE_PER_GB, currency, PRICE_PER_GB_ARS)}</span>
            {t.hero.titleAfter}
          </h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <ul className="hero-facts">
            {t.hero.facts.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
        <Configurator ram={ram} onRamChange={onRamChange} />
      </div>
    </section>
  );
}
