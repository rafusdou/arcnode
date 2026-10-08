import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { ARCNODE_PLANS } from "../data/plans.js";
import { fmtPrice } from "../utils/currency.js";

const MIN_RAM = 1;
const MAX_RAM = 25;

export default function Configurator({ ram, onRamChange }) {
  const { t, currency } = useApp();
  const plan = ARCNODE_PLANS.find((p) => p.ram === ram);
  const fill = ((ram - MIN_RAM) / (MAX_RAM - MIN_RAM)) * 100;

  return (
    <div className="config">
      <div className="config-head">
        <label htmlFor="config-ram">{t.config.ram}</label>
        <output htmlFor="config-ram" className="config-ram">{ram} GB</output>
      </div>
      <input
        id="config-ram"
        type="range"
        className="slider"
        min={MIN_RAM}
        max={MAX_RAM}
        step="1"
        value={ram}
        onChange={(e) => onRamChange(Number(e.target.value))}
        style={{ "--fill": `${fill}%` }}
      />
      <div className="config-scale"><span>{MIN_RAM} GB</span><span>{MAX_RAM} GB</span></div>

      <dl className="config-specs">
        <div><dt>{t.config.plan}</dt><dd>{plan.name}</dd></div>
        <div><dt>{t.config.players}</dt><dd>{t.config.playersValue}</dd></div>
        <div><dt>{t.config.disk}</dt><dd>{parseInt(plan.ssd, 10)} GB</dd></div>
      </dl>
      <p className="config-note">{t.config.playersNote(plan.players)}</p>

      <div className="config-total">
        <span className="config-total-label">{t.config.total}</span>
        <span>
          <strong>{fmtPrice(plan.price, currency, plan.priceARS)}</strong>
          <span className="config-mo">{t.config.perMonth}</span>
        </span>
      </div>
      <Link className="btn btn-primary btn-block" to={`/checkout?plan=${encodeURIComponent(plan.name)}`}>
        {t.config.cta(ram)}
      </Link>
      <p className="config-free">
        {t.config.freeQ} <Link to="/checkout?plan=Piedra">{t.config.freeLink}</Link>.
      </p>
    </div>
  );
}
