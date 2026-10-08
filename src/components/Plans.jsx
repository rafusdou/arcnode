import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { ARCNODE_PLANS } from "../data/plans.js";
import { fmtPrice } from "../utils/currency.js";

const TIER_KEYS = { all: null, free: "Gratis", basic: "Básico", inter: "Intermedio", adv: "Avanzado", elite: "Elite" };

function PlanCard({ p, selected, currency, t }) {
  const cls = ["plan-card"];
  if (p.free) cls.push("plan-free");
  if (selected) cls.push("is-selected");

  return (
    <div className={cls.join(" ")}>
      <div className="plan-top">
        <span className="plan-name">{p.name}</span>
        {p.free && <span className="plan-tag">{t.plans.freeBadge}</span>}
      </div>
      <div className="plan-ram">{p.free ? t.plans.freeRam : `${p.ram} GB`}</div>
      <div className="plan-price">
        <strong>{p.free ? t.plans.free : fmtPrice(p.price, currency, p.priceARS)}</strong>
        {!p.free && <span>{t.plans.perMonth}</span>}
      </div>
      <ul className="plan-feats">
        <li>{t.plans.players(p.players)}</li>
        <li>{t.plans.disk(parseInt(p.ssd, 10))}</li>
        <li className={p.backups ? undefined : "off"}>{p.backups ? t.plans.backups : t.plans.noBackups}</li>
        <li>{p.free ? t.plans.supportBasic : t.plans.supportDiscord}</li>
      </ul>
      <Link
        to={`/checkout?plan=${encodeURIComponent(p.name)}`}
        className={"btn btn-block " + (p.free || selected ? "btn-primary" : "btn-outline")}
      >
        {p.free ? t.plans.tryFree : t.plans.pick}
      </Link>
    </div>
  );
}

export default function Plans({ selectedRam }) {
  const { t, currency } = useApp();
  const [active, setActive] = useState("all");

  const groups = useMemo(() => {
    const g = [];
    ARCNODE_PLANS.forEach((p) => {
      if (p.tier) g.push({ tier: p.tier, items: [] });
      g[g.length - 1].items.push(p);
    });
    return g;
  }, []);

  const visible = active === "all" ? groups : groups.filter((g) => g.tier === TIER_KEYS[active]);

  return (
    <section className="pricing" id="planes">
      <div className="pricing-inner">
        <div className="pricing-head">
          <h2>{t.plans.title}</h2>
          <p>{t.plans.note}</p>
        </div>

        <div className="tier-tabs" role="tablist">
          {Object.keys(TIER_KEYS).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={active === k}
              className={"tier-tab " + (active === k ? "active" : "")}
              onClick={() => setActive(k)}
            >
              {t.plans.tabs[k]}
            </button>
          ))}
        </div>

        {visible.map((g) => {
          const key = Object.keys(TIER_KEYS).find((k) => TIER_KEYS[k] === g.tier);
          return (
            <div className="tier-block" key={g.tier}>
              <div className="tier-head">
                <h3>{t.plans.tabs[key]}</h3>
                <span>{t.plans.tierDesc[g.tier]}</span>
              </div>
              <div className="plan-grid">
                {g.items.map((p) => (
                  <PlanCard key={p.name} p={p} selected={p.ram === selectedRam} currency={currency} t={t} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
