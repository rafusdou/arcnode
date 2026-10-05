import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";

const TIERS = [
  { n: "Referido", pct: "1 mes", m: "1 mes de descuento o crédito por cada referido que paga" },
];

export default function Afiliados() {
  return (
    <>
      <PageHeader
        eyebrow="Programa de afiliados"
        title="Recomendá ArcNode. Ganá crédito en tu cuenta."
        sub="Cada cliente recibe un código único. Sin mínimos, sin letra chica."
        actions={<Link className="btn btn-primary btn-lg" to="/signup">Activar mi código</Link>}
      />
      <div className="page-section">
        <div className="affiliate-tiers">
          {TIERS.map((t, i) => (
            <div className="aff-tier" key={i}>
              <div className="aff-tier-name">{t.n}</div>
              <div className="aff-tier-pct">{t.pct}</div>
              <div className="aff-tier-meta">{t.m}</div>
            </div>
          ))}
        </div>
        <div className="legal-content" style={{ marginTop: 48, maxWidth: 760 }}>
          <h2>Cómo funciona</h2>
          <p>Te damos un código único. Quien se registre con ese código y pague un plan, te genera 1 mes de descuento o crédito en tu cuenta — configurable desde el panel.</p>
          <h2>Quién puede sumarse</h2>
          <p>Streamers, YouTubers, owners de comunidades, profesores, o cualquier persona con audiencia. No hay mínimo de seguidores.</p>
          <h2>Cuándo se acredita</h2>
          <p>El crédito se aplica automáticamente en tu próxima factura apenas tu referido confirma el pago.</p>
        </div>
      </div>
    </>
  );
}
