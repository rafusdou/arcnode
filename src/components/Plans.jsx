import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { ARCNODE_PLANS } from "../data/plans.js";
import { fmtPrice } from "../utils/currency.js";

function Feat({ ok, children, strong }) {
  return (
    <li className={"feat " + (ok ? "feat-on" : "feat-off")}>
      {ok ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M6 18L18 6" /></svg>
      )}
      <span className={strong ? "feat-strong" : ""}>{children}</span>
    </li>
  );
}

function PlanCard({ p, currency, isFeatured, t }) {
  const cls = ["plan-card"];
  if (p.free) cls.push("plan-free");
  if (isFeatured) cls.push("plan-featured");
  return (
    <div className={cls.join(" ")}>
      {isFeatured && <div className="plan-badge">{t.plans.popular}</div>}
      {p.free && <div className="plan-badge plan-badge-free">{t.plans.freeBadge}</div>}

      <div className="plan-name">{p.name}</div>
      <div className="plan-ram">
        {p.free ? t.plans.free : `${p.ram} GB`}
        {!p.free && <span className="plan-ram-label">{t.plans.ram}</span>}
      </div>

      <div className="plan-price">
        <span className="plan-price-val">{fmtPrice(p.price, currency, p.priceARS)}</span>
        <span className="plan-price-mo">{p.price === 0 ? t.plans.forever : t.plans.perMonth}</span>
      </div>
      {p.pgb && <div className="plan-pgb">{fmtPrice(p.pgb, currency, p.pgbARS)} {t.plans.perGb}</div>}

      <ul className="plan-feats">
        <Feat ok strong>{p.players} {t.plans.players}</Feat>
        <Feat ok>{p.ssd}</Feat>
        <Feat ok={!!p.modpacks}>{p.modpacks ? t.plans.modsLabel() : t.plans.noMods}</Feat>
        <Feat ok={!!p.backups}>{p.backups ? t.plans.backupLabel(p.backups) : t.plans.noBackup}</Feat>
        <Feat ok={p.ddos}>{t.plans.antiDdos}</Feat>
        <Feat ok={!!p.support}>{p.support ? t.plans.supportLabel() : t.plans.noSupport}</Feat>
      </ul>

      <Link to={`/checkout?plan=${encodeURIComponent(p.name)}`} className={"btn " + (isFeatured || p.free ? "btn-primary" : "btn-outline") + " plan-cta"}>
        {p.free ? t.plans.ctaFree : t.plans.ctaPick(p.name)}
      </Link>
    </div>
  );
}

export default function Plans() {
  const { t, currency } = useApp();
  const tierKeys = ["all", "free", "basic", "inter", "adv", "elite"];
  const tierMap = { all: null, free: "Gratis", basic: "Básico", inter: "Intermedio", adv: "Avanzado", elite: "Elite" };
  const [activeKey, setActiveKey] = useState("all");
  const featuredName = "Blaze";

  const groups = useMemo(() => {
    const g = [];
    let cur = null;
    ARCNODE_PLANS.forEach((p) => {
      if (p.tier) { cur = { tier: p.tier, items: [] }; g.push(cur); }
      cur.items.push(p);
    });
    return g;
  }, []);

  const visible = activeKey === "all" ? groups : groups.filter((g) => g.tier === tierMap[activeKey]);

  return (
    <section className="plans" id="planes">
      <div className="section-head">
        <div className="eyebrow"><span className="dot" /> {t.plans.eyebrow}</div>
        <h2>{t.plans.title}</h2>
        <p>{t.plans.sub}</p>
      </div>

      <div className="tier-tabs">
        {tierKeys.map((k) => (
          <button key={k} className={"tab " + (activeKey === k ? "active" : "")} onClick={() => setActiveKey(k)}>
            {t.plans.tabs[k]}
          </button>
        ))}
      </div>

      {visible.map((g) => (
        <div className="tier-block" key={g.tier}>
          <div className="tier-head">
            <h3>{t.plans.tabs[Object.keys(tierMap).find((k) => tierMap[k] === g.tier)] || g.tier}</h3>
            <span>{t.plans.tierDesc[g.tier]}</span>
          </div>
          <div className="plan-grid">
            {g.items.map((p) => (
              <PlanCard key={p.name} p={p} currency={currency} isFeatured={p.name === featuredName} t={t} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
