import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";

const STEPS = [
  {
    t: "Bajá tu servidor del host actual",
    d: "Descargá la carpeta del mundo (normalmente se llama world) y, si usás plugins o mods, también las carpetas plugins o mods. La mayoría de los hosts tiene un administrador de archivos o acceso por FTP para esto. Comprimí todo en un .zip.",
  },
  {
    t: "Creá tu servidor en Changuihost",
    d: "Elegí el mismo tipo (Paper con Paper, Forge con Forge) y la misma versión de Minecraft que tenías. Si cambiás de versión, el mundo puede no cargar bien.",
  },
  {
    t: "Apagalo y borrá el mundo nuevo",
    d: "En el panel, tocá Stop. Después entrá a Files y borrá la carpeta world que se generó en el primer arranque.",
  },
  {
    t: "Subí tu .zip y descomprimilo",
    d: "En Files, usá Upload para subir el .zip y después Unarchive para descomprimirlo. La carpeta del mundo tiene que quedar con el nombre world, o tenés que cambiar level-name en server.properties para que coincida.",
  },
  {
    t: "Prendelo y probá",
    d: "Tocá Start, esperá a que la consola diga Done y entrá desde Minecraft con la IP del servidor.",
  },
];

export default function Migrar() {
  return (
    <>
      <PageHeader
        eyebrow="Migrar"
        title="Traé tu servidor de otro host"
        sub="Mover un servidor de Minecraft es, en el fondo, copiar unas carpetas. Así se hace."
        actions={<Link className="btn btn-primary btn-lg" to="/#calc">Elegir un plan</Link>}
      />
      <div className="page-section">
        <div className="migrate-steps">
          {STEPS.map((s, i) => (
            <div className="migrate-step" key={s.t}>
              <div className="migrate-num">{i + 1}</div>
              <div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="page-note">Si te trabás en algún paso, abrí un ticket en nuestro Discord y lo vemos juntos.</p>
      </div>
    </>
  );
}
