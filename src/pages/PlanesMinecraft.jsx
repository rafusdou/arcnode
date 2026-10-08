import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";

const CARDS = [
  { t: "Vanilla / Paper", d: "Servidores optimizados para survival, creative y minijuegos. Plugins ilimitados." },
  { t: "Forge / Fabric", d: "Cualquier modpack de CurseForge o FTB se instala a pedido por Discord. ATM10, Better MC, RLCraft listos." },
  { t: "Bedrock & Geyser", d: "Tus amigos en Xbox, PS, Switch y celular juegan en el mismo mundo que los de PC." },
  { t: "BungeeCord / Velocity", d: "Redes multi-servidor con proxy. Lobbies, minijuegos y survival en una sola IP." },
  { t: "Versiones desde 1.7", d: "Soportamos 1.7.10 hasta la última 1.21. Cambiás de versión sin perder mundo." },
  { t: "Subdominio gratis", d: "tuserver.arcnode.cc incluido. IP dedicada disponible desde el plan Esmeralda." },
];

export default function PlanesMinecraft() {
  return (
    <>
      <PageHeader
        eyebrow="Minecraft Hosting"
        title="26 planes desde gratis hasta 25 GB de RAM"
        sub="$1,80 USD por GB de RAM, siempre. Cambiá entre planes con un click — sin migraciones, sin downtime."
        actions={<>
          <Link className="btn btn-primary btn-lg" to="/#planes">Ver todos los planes</Link>
          <Link className="btn btn-ghost btn-lg" to="/#calc">Calculadora de RAM</Link>
        </>}
      />
      <div className="page-section">
        <div className="cards-row">
          {CARDS.map((c, i) => (
            <div className="info-card" key={i}>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
