import { useState } from "react";
import PageHeader from "../components/PageHeader.jsx";

const TABS = ["Console", "Files", "Databases", "Schedules", "Users", "Backups", "Network", "Startup", "Settings", "Activity"];

const BOOT_LOG = [
  "[12:01:02 INFO]: Starting minecraft server version 1.21.4",
  "[12:01:02 INFO]: Loading properties",
  "[12:01:03 INFO]: Default game type: SURVIVAL",
  '[12:01:05 INFO]: Preparing level "world"',
  "[12:01:09 INFO]: Preparing spawn area: 100%",
  '[12:01:11 INFO]: Done (8.412s)! For help, type "help"',
  "[12:03:40 INFO]: Steve joined the game",
];

export default function PanelDemo() {
  const [lines, setLines] = useState(BOOT_LOG);
  const [command, setCommand] = useState("");

  const send = (e) => {
    e.preventDefault();
    if (!command.trim()) return;
    setLines((l) => [...l, `> ${command.trim()}`]);
    setCommand("");
  };

  return (
    <>
      <PageHeader
        eyebrow="Panel"
        title="Así se ve el panel"
        sub="Es Pterodactyl con los colores de ArcNode. Está en inglés. Esto es una vista de ejemplo: la consola de abajo no está conectada a ningún servidor."
      />
      <div className="page-section">
        <div className="demo-frame">
          <aside className="demo-side">
            {TABS.map((n) => (
              <div key={n} className={"demo-nav-item " + (n === "Console" ? "active" : "")}>{n}</div>
            ))}
          </aside>
          <div className="demo-main">
            <div className="demo-stats">
              <div className="demo-stat"><div className="demo-stat-label">Address</div><div className="demo-stat-val mono">203.0.113.24:25567</div></div>
              <div className="demo-stat"><div className="demo-stat-label">Uptime</div><div className="demo-stat-val">2h 14m</div></div>
              <div className="demo-stat"><div className="demo-stat-label">CPU</div><div className="demo-stat-val">14%</div></div>
              <div className="demo-stat"><div className="demo-stat-label">Memory</div><div className="demo-stat-val">1.2 / 2 GiB</div></div>
            </div>
            <div className="demo-console">
              {lines.map((l, i) => <div key={i}>{l}</div>)}
            </div>
            <form className="demo-input" onSubmit={send}>
              <input type="text" value={command} onChange={(e) => setCommand(e.target.value)} placeholder="Type a command..." aria-label="Comando" />
              <button type="submit" className="btn btn-primary">Enviar</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
