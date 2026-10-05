import { useMemo } from "react";
import PageHeader from "../components/PageHeader.jsx";

const SERVICES = [
  { n: "Panel Pterodactyl", up: 100 },
  { n: "API ArcNode", up: 100 },
  { n: "Red Buenos Aires (BA-1)", up: 100 },
  { n: "Red Buenos Aires (BA-2)", up: 99 },
  { n: "DNS y subdominios", up: 100 },
  { n: "Backups automáticos", up: 100 },
  { n: "MercadoPago / pagos", up: 98 },
  { n: "Discord soporte", up: 100 },
];

function StatusRow({ s }) {
  const bars = useMemo(() => Array.from({ length: 60 }, () => Math.random()), []);
  return (
    <div className="status-row">
      <div className="status-row-name">
        <span className="status-pulse" style={{ background: s.up >= 99 ? "var(--green)" : "var(--amber)", boxShadow: "none", width: 8, height: 8 }} />
        {s.n}
      </div>
      <div className="status-bars">
        {bars.map((r, j) => {
          const cls = s.up < 99 && r > 0.96 ? "warn" : s.up < 95 && r > 0.92 ? "down" : "";
          return <div key={j} className={"status-bar " + cls} />;
        })}
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginLeft: 16, fontVariantNumeric: "tabular-nums" }}>{s.up}%</div>
    </div>
  );
}

export default function Status() {
  return (
    <>
      <PageHeader eyebrow="Estado de red" title="Estado de los sistemas." sub="Actualizado en vivo cada 60 segundos." />
      <div className="page-section">
        <div className="status-overall">
          <div className="status-pulse" />
          <div>
            <strong>Todos los sistemas operativos.</strong>
            <div><span>Sin incidentes en las últimas 24 horas.</span></div>
          </div>
        </div>
        <div className="status-list">
          {SERVICES.map((s, i) => <StatusRow s={s} key={i} />)}
        </div>
      </div>
    </>
  );
}
