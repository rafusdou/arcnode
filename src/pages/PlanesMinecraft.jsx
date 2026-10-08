import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import Plans from "../components/Plans.jsx";

const CARDS = [
  { t: "Paper", d: "Vanilla optimizado, para survival o minijuegos. Soporta plugins de Bukkit, Spigot y Paper." },
  { t: "Vanilla", d: "El servidor oficial de Mojang, sin cambios. Para jugar como en single-player, con amigos." },
  { t: "Forge", d: "Para mods y modpacks. Pide más RAM que Paper; mirá la guía de modpacks antes de elegir." },
  { t: "Versiones", d: "De la 1.16.5 a la última. La elegís cuando creás el servidor." },
  { t: "Minecraft Java", d: "Los servidores son de Java Edition. Bedrock (celular y consolas) todavía no está disponible." },
  { t: "Panel", d: "Consola en vivo, archivos, reinicios programados y subusuarios con permisos." },
];

export default function PlanesMinecraft() {
  return (
    <>
      <PageHeader
        eyebrow="Planes"
        title="Servidores de Minecraft, de 1 a 25 GB"
        sub="$1,80 USD por GB de RAM en todos los planes, y uno gratis para probar."
        actions={<Link className="btn btn-primary btn-lg" to="/#calc">Calcular cuánta RAM necesito</Link>}
      />
      <div className="page-section">
        <div className="cards-row">
          {CARDS.map((c) => (
            <div className="info-card" key={c.t}>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </div>
          ))}
        </div>
      </div>
      <Plans selectedRam={null} />
    </>
  );
}
