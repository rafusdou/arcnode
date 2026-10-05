import PageHeader from "../components/PageHeader.jsx";

const TUTS = [
  { t: "Cómo crear tu primer servidor de Minecraft", c: "Básico", time: "8 min", icon: "01" },
  { t: "Cómo pedir un modpack de CurseForge por Discord", c: "Mods", time: "12 min", icon: "02" },
  { t: "Configurar permisos con LuckPerms", c: "Plugins", time: "15 min", icon: "03" },
  { t: "Setup completo de BungeeCord para una red", c: "Avanzado", time: "25 min", icon: "04" },
  { t: "Optimizar TPS con paper.yml y spigot.yml", c: "Performance", time: "10 min", icon: "05" },
  { t: "Backups automáticos y restauración", c: "Básico", time: "6 min", icon: "06" },
  { t: "Conectar Java y Bedrock con Geyser", c: "Avanzado", time: "9 min", icon: "07" },
  { t: "Schedulers: reinicio automático y mensajes", c: "Plugins", time: "7 min", icon: "08" },
  { t: "Migrar desde Aternos / Minehut", c: "Migración", time: "11 min", icon: "09" },
  { t: "Subir tu mundo de single-player al server", c: "Básico", time: "5 min", icon: "10" },
];

export default function Tutoriales() {
  return (
    <>
      <PageHeader eyebrow="Tutoriales" title="Aprendé a sacarle todo a tu servidor." sub="Guías paso a paso, en español, con video y screenshots." />
      <div className="page-section">
        {TUTS.map((t, i) => (
          <div className="tutorial-card" key={i}>
            <div className="tutorial-thumb" style={{ background: `linear-gradient(135deg, hsl(${i * 35} 60% 45%), hsl(${i * 35 + 50} 60% 50%))` }}>{t.icon}</div>
            <div>
              <div className="tutorial-title">{t.t}</div>
              <div className="tutorial-meta">{t.c} · ArcNode</div>
            </div>
            <div className="tutorial-time">⏱ {t.time}</div>
          </div>
        ))}
      </div>
    </>
  );
}
