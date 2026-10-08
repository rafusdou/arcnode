import PageHeader from "../components/PageHeader.jsx";

export default function Docs() {
  return (
    <>
      <PageHeader eyebrow="Documentación" title="Todo lo que necesitás para correr tu server." sub="Guías, referencias y troubleshooting. Si algo falta, escribinos al Discord." />
      <div className="page-section">
        <div className="docs-grid">
          <aside className="docs-side">
            <h4>Empezar</h4>
            <a href="#" className="active">Crear tu primer server</a>
            <a href="#">Conectarte por primera vez</a>
            <a href="#">Subdominio e IP dedicada</a>
            <h4>Configuración</h4>
            <a href="#">server.properties</a>
            <a href="#">Permisos y operadores</a>
            <a href="#">Variables JVM</a>
            <h4>Mods y plugins</h4>
            <a href="#">Modpacks a pedido</a>
            <a href="#">Plugins de Paper</a>
            <a href="#">Forge vs Fabric</a>
            <h4>Avanzado</h4>
            <a href="#">SFTP y rsync</a>
            <a href="#">BungeeCord setup</a>
            <a href="#">API de ArcNode</a>
          </aside>
          <article className="docs-content">
            <h2>Crear tu primer server</h2>
            <p>Después de crear tu cuenta, vas a llegar al panel de control. Para crear un servidor nuevo, hacé click en el botón <strong>+ Nuevo servidor</strong> arriba a la derecha.</p>
            <h3>1. Elegí tu plan</h3>
            <p>Vas a ver los 26 planes disponibles, todos a $1,80 USD por GB de RAM. Si no estás seguro de cuánto necesitás, usá la <a href="/#calc">calculadora de RAM</a>.</p>
            <h3>2. Configurá las opciones</h3>
            <p>Elegí versión y tipo (Paper, Forge, Fabric). Si querés un modpack preinstalado, abrí un ticket en Discord — lo instalamos en menos de 1 hora.</p>
            <h3>3. Encendé el servidor</h3>
            <p>El servidor arranca en menos de 30 segundos. Vas a ver la consola en vivo cargar el mundo.</p>
            <pre>{`# Conectarse por SFTP
sftp -P 2022 user.server@sftp.arcnode.cc

# O usá el file manager web
https://panel.arcnode.cc/server/<id>/files`}</pre>
            <h3>4. Conectarte desde Minecraft</h3>
            <p>Abrí Minecraft, andá a <strong>Multijugador → Agregar servidor</strong> y pegá tu IP: <code>tuserver.arcnode.cc</code>.</p>
          </article>
        </div>
      </div>
    </>
  );
}
