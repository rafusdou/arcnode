import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";

const STEPS = [
  { n: 1, t: "Creá tu cuenta", d: "Sin tarjeta. Tardás 30 segundos." },
  { n: 2, t: "Decinos de dónde venís", d: "Nos pasás el IP, panel actual y credenciales SFTP. Encriptado, eliminado al terminar." },
  { n: 3, t: "Migramos por vos", d: "Mundo, plugins, configs, jugadores, permisos, backups históricos. Todo." },
  { n: 4, t: "Apuntamos tu IP", d: "Te damos un subdominio temporal mientras se propaga el DNS de tu dominio actual." },
  { n: 5, t: "Probás todo", d: "Tenés 14 días para verificar que funciona. Si algo está mal, te devolvemos el dinero." },
];

export default function Migrar() {
  return (
    <>
      <PageHeader
        eyebrow="Migrar de otro host"
        title="Te mudamos gratis. En menos de 24hs."
        sub="Vení de Aternos, Apex, Bisect, Minehut, Shockbyte o cualquier otro. Lo hacemos por vos sin perder un solo bloque."
        actions={<Link className="btn btn-primary btn-lg" to="/signup">Empezar migración</Link>}
      />
      <div className="page-section">
        <div className="migrate-steps">
          {STEPS.map((s) => (
            <div className="migrate-step" key={s.n}>
              <div className="migrate-num">{s.n}</div>
              <div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
