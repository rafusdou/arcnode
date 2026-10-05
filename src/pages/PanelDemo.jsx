import { useState } from "react";
import PageHeader from "../components/PageHeader.jsx";

export default function PanelDemo() {
  const [tab, setTab] = useState("Consola");
  return (
    <>
      <PageHeader
        eyebrow="Panel Pterodactyl"
        title="El panel de control más completo del mercado."
        sub="Consola en vivo, file manager, schedulers, SFTP, backups, sub-usuarios. Probalo sin registrarte."
      />
      <div className="page-section">
        <div className="demo-frame">
          <aside className="demo-side">
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px 12px", borderBottom: "1px solid var(--border)" }}>
              <span className="dot" style={{ background: "var(--green)" }} />
              <strong style={{ color: "var(--text)", fontSize: 14 }}>survival.arcnode.cc</strong>
            </div>
            <div className="demo-side-h">Server</div>
            {["Consola", "Archivos", "Bases de datos", "Schedulers", "Backups", "Red", "Sub-usuarios"].map((n) => (
              <div key={n} className={"demo-nav-item " + (tab === n ? "active" : "")} onClick={() => setTab(n)}>{n}</div>
            ))}
            <div className="demo-side-h">Cuenta</div>
            <div className="demo-nav-item">Facturación</div>
            <div className="demo-nav-item">Tickets</div>
          </aside>
          <div className="demo-main">
            <div className="demo-stats">
              <div className="demo-stat"><div className="demo-stat-label">CPU</div><div className="demo-stat-val">14%</div><div className="demo-stat-delta">↓ 2%</div></div>
              <div className="demo-stat"><div className="demo-stat-label">RAM</div><div className="demo-stat-val">4.2 GB</div><div className="demo-stat-delta">de 12 GB</div></div>
              <div className="demo-stat"><div className="demo-stat-label">TPS</div><div className="demo-stat-val">20.0</div><div className="demo-stat-delta">óptimo</div></div>
              <div className="demo-stat"><div className="demo-stat-label">Players</div><div className="demo-stat-val">3 / 150</div><div className="demo-stat-delta">en línea</div></div>
            </div>
            <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.7, height: 280, overflowY: "auto" }}>
              <div style={{ color: "#5DCAA5" }}>[Server] Done (2.847s)! For help, type "help"</div>
              <div style={{ color: "#94a3b8" }}>[16:42:14] Steve_BA joined the game</div>
              <div style={{ color: "#94a3b8" }}>[16:42:29] MaxiCrafter joined the game</div>
              <div style={{ color: "#378ADD" }}>[Tickets] TPS: 20.0  RAM: 4.2/12GB  CPU: 14%</div>
              <div style={{ color: "#94a3b8" }}>[16:42:47] Lucia_99 joined the game</div>
              <div style={{ color: "#1D9E75" }}>[Backup] Snapshot creado · 1.4 GB · backup-2026-05-03.tar</div>
              <div style={{ color: "#94a3b8" }}>[16:43:15] &lt;Steve_BA&gt; vamo a la cueva</div>
              <div style={{ color: "#94a3b8" }}>[16:43:22] &lt;Lucia_99&gt; voy</div>
              <div style={{ color: "#5DCAA5" }}>_</div>
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <input type="text" placeholder="Comando o mensaje..." style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 8, padding: 10, color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 12 }} />
              <button className="btn btn-primary">Enviar</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
