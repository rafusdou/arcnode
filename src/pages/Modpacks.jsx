import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";

export default function Modpacks() {
  return (
    <>
      <PageHeader
        eyebrow="Modpacks"
        title="Modpacks con Forge"
        sub="Elegís Forge al crear el servidor y le subís el server pack del modpack que quieras."
        actions={<Link className="btn btn-primary btn-lg" to="/#calc">Elegir un plan</Link>}
      />
      <div className="page-section">
        <div className="legal-content">
          <h2>Qué modpacks funcionan</h2>
          <p>
            Los que usan Forge, en alguna de estas versiones de Minecraft: 1.16.5, 1.18.2, 1.19.4, 1.20.4,
            1.21.4 o la última. Los modpacks de Fabric o de NeoForge todavía no los soportamos (por
            ejemplo, All The Mods 10 usa NeoForge). Antes de pagar, fijate en la página del modpack qué
            loader y qué versión usa.
          </p>
          <h2>Cómo instalarlo</h2>
          <ul>
            <li>Creá el servidor con Forge y la misma versión de Minecraft que pide el modpack.</li>
            <li>Bajá el <strong>server pack</strong> desde la página del modpack en CurseForge. Suele estar en la pestaña Files, como archivo adicional.</li>
            <li>En el panel, entrá a Files y subí los mods del server pack a la carpeta <code>mods</code>. Si trae una carpeta <code>config</code>, subila también.</li>
            <li>Reiniciá el servidor desde la consola. El primer arranque con muchos mods puede tardar varios minutos.</li>
          </ul>
          <h2>Cuánta RAM necesitás</h2>
          <p>
            Un modpack liviano, con pocas decenas de mods, anda bien con 4 a 6 GB. Los grandes, con cientos
            de mods o mucha tecnología, piden 8 GB o más. La página de cada modpack suele recomendar un
            mínimo: usá ese número como base.
          </p>
          <h2>Si no te sale</h2>
          <p>Abrí un ticket en nuestro Discord con el nombre del modpack y te damos una mano con la instalación.</p>
        </div>
      </div>
    </>
  );
}
