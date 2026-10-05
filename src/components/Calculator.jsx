import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { ARCNODE_PLANS } from "../data/plans.js";
import { fmtPrice } from "../utils/currency.js";
import Icon from "./Icon.jsx";

const ramForPlayers = (players, heavy) => {
  const base = 1 + players * 0.4;
  return Math.ceil(heavy ? base * 1.5 : base);
};

export default function Calculator() {
  const { t, currency } = useApp();
  const [players, setPlayers] = useState(20);
  const [modType, setModType] = useState("vanilla");
  const heavy = modType === "heavy";
  const recommendedRam = ramForPlayers(players, heavy);
  const recommendedPlan = useMemo(
    () => ARCNODE_PLANS.find((p) => p.ram >= recommendedRam) || ARCNODE_PLANS[ARCNODE_PLANS.length - 1],
    [recommendedRam]
  );

  return (
    <section className="calc" id="calc">
      <div className="calc-grid">
        <div className="calc-left">
          <div className="eyebrow"><span className="dot" /> {t.calc.eyebrow}</div>
          <h2>{t.calc.title}</h2>
          <p>{t.calc.sub}</p>

          <div className="field">
            <label>{t.calc.players}</label>
            <div className="slider-wrap">
              <input type="range" min="2" max="500" step="1" value={players} onChange={(e) => setPlayers(+e.target.value)} className="slider" />
              <div className="slider-value">{players} <span>{t.calc.playersUnit}</span></div>
            </div>
            <div className="slider-marks">
              <span>2</span><span>50</span><span>150</span><span>300</span><span>500</span>
            </div>
          </div>

          <div className="field">
            <label>{t.calc.type}</label>
            <div className="seg">
              {[["vanilla", t.calc.vanilla], ["light", t.calc.light], ["heavy", t.calc.heavy]].map(([k, l]) => (
                <button key={k} className={"seg-opt " + (modType === k ? "active" : "")} onClick={() => setModType(k)}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="calc-right">
          <div className="calc-result">
            <div className="cr-label">{t.calc.result}</div>
            <div className="cr-ram">{recommendedRam} GB <span>{t.calc.ram}</span></div>
            {recommendedPlan && (
              <div className="cr-plan">
                <div className="cr-plan-name">{recommendedPlan.name}</div>
                <div className="cr-plan-meta">{t.calc.planMeta(recommendedPlan.ram, recommendedPlan.players, recommendedPlan.ssd)}</div>
                <div className="cr-plan-price">
                  <span className="cr-price">{fmtPrice(recommendedPlan.price, currency, recommendedPlan.priceARS)}</span>
                  <span className="cr-mo">{t.calc.perMonth}</span>
                </div>
                <Link className="btn btn-primary" to={`/checkout?plan=${encodeURIComponent(recommendedPlan.name)}`}>
                  {t.calc.pick(recommendedPlan.name)}
                </Link>
              </div>
            )}
            <div className="cr-note">
              <Icon name="zap" size={14} /> {t.calc.note}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
