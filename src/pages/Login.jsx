import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";

const PANEL_URL = import.meta.env.VITE_PANEL_URL;

export default function Login() {
  return (
    <>
      <PageHeader
        eyebrow="Panel"
        title="Iniciar sesión"
        sub="Tu cuenta y tus servidores se manejan desde el panel de ArcNode."
        actions={PANEL_URL && <a className="btn btn-primary btn-lg" href={PANEL_URL}>Ir al panel</a>}
      />
      <div className="page-section">
        <div className="legal-content">
          <h2>Cómo entrar</h2>
          <p>
            Entrás al panel con el email y la contraseña que pusiste cuando creaste tu servidor.
            {!PANEL_URL && " El link al panel aparece al terminar la compra, junto con tu usuario."}
          </p>
          <h2>¿Todavía no tenés cuenta?</h2>
          <p>
            Se crea sola cuando elegís tu primer servidor, también con el plan gratis.{" "}
            <Link to="/#calc">Elegir un plan</Link>.
          </p>
          <h2>¿Te olvidaste la contraseña?</h2>
          <p>Abrí un ticket en nuestro Discord con el email de tu cuenta y te la reseteamos.</p>
        </div>
      </div>
    </>
  );
}
