import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
    <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 015.5 12c0-.73.13-1.44.34-2.1V7.07H2.18a11 11 0 000 9.87l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.46 2.1 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
);

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
);

export default function Login() {
  return (
    <div className="auth-wrap">
      <aside className="auth-side">
        <div className="auth-side-content">
          <Logo />
          <h2>Bienvenido de vuelta.</h2>
          <p>Tus servidores te esperan.</p>
          <ul className="auth-perks">
            <li><Check /> Acceso al panel Pterodactyl</li>
            <li><Check /> Consola en vivo y file manager</li>
            <li><Check /> Tickets y chat con soporte 24/7</li>
            <li><Check /> Restaurar backups con un click</li>
          </ul>
        </div>
        <div style={{ position: "relative", color: "var(--muted)", fontSize: 12 }}>
          12.847 servidores activos · 2.847 jugando ahora
        </div>
      </aside>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <h1>Iniciar sesión</h1>
          <p>Ingresá a tu panel ArcNode.</p>

          <button type="button" className="btn-google">
            <GoogleIcon /> Continuar con Google
          </button>
          <div className="divider-or">o con email</div>

          <div className="input-row">
            <div className="input"><label>Email o usuario</label><input type="text" placeholder="vos@ejemplo.com" /></div>
            <div className="input">
              <label style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Contraseña</span>
                <a href="#" style={{ textTransform: "none", letterSpacing: 0, color: "var(--blue)" }}>¿Olvidaste?</a>
              </label>
              <input type="password" placeholder="••••••••" />
            </div>
          </div>

          <label className="checkbox" style={{ margin: "8px 0 18px" }}>
            <input type="checkbox" /> <span>Mantener sesión iniciada</span>
          </label>

          <button type="submit" className="btn btn-primary btn-block">Iniciar sesión</button>
          <div className="auth-footer">¿Sin cuenta? <Link to="/signup">Crear cuenta gratis</Link></div>
        </form>
      </div>
    </div>
  );
}
