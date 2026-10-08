import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { ARCNODE_PLANS } from "../data/plans.js";
import { fmtPrice } from "../utils/currency.js";

export default function Plans({ selectedRam }) {
  const { t, currency } = useApp();
  return (
    <section className="pricing" id="planes">
      <div className="pricing-inner">
        <div className="pricing-head">
          <h2>{t.plans.title}</h2>
          <p>{t.plans.note}</p>
        </div>
        <div className="price-table-wrap">
          <table className="price-table">
            <thead>
              <tr>
                <th>{t.plans.cols.plan}</th>
                <th className="num">{t.plans.cols.ram}</th>
                <th className="num col-players">{t.plans.cols.players}</th>
                <th className="num col-disk">{t.plans.cols.disk}</th>
                <th className="num">{t.plans.cols.price}</th>
                <th><span className="sr-only">{t.plans.cols.action}</span></th>
              </tr>
            </thead>
            <tbody>
              {ARCNODE_PLANS.map((p) => (
                <tr key={p.name} className={p.ram === selectedRam ? "is-selected" : undefined}>
                  <td className="plan-cell">{p.name}</td>
                  <td className="num">{p.free ? "—" : `${p.ram} GB`}</td>
                  <td className="num col-players">{p.players}</td>
                  <td className="num col-disk">{parseInt(p.ssd, 10)} GB</td>
                  <td className="num price-cell">{p.free ? t.plans.free : fmtPrice(p.price, currency, p.priceARS)}</td>
                  <td className="action-cell">
                    <Link to={`/checkout?plan=${encodeURIComponent(p.name)}`}>{p.free ? t.plans.tryFree : t.plans.pick}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
