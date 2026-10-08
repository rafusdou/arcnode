import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";

const SECTIONS = [
  ["crear", "Crear tu servidor"],
  ["panel", "Entrar al panel"],
  ["conectar", "Conectarte desde Minecraft"],
  ["op", "Darte permisos de operador"],
  ["propiedades", "Cambiar la configuración"],
  ["plugins", "Subir plugins o mods"],
  ["mundo", "Subir un mundo propio"],
  ["ayuda", "Si algo no anda"],
];

export default function Docs() {
  return (
    <>
      <PageHeader
        eyebrow="Documentación"
        title="Cómo usar tu servidor"
        sub="Lo básico para arrancar. Si algo no está acá, preguntanos por Discord y lo sumamos."
      />
      <div className="page-section">
        <div className="docs-grid">
          <aside className="docs-side">
            {SECTIONS.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
          </aside>
          <article className="docs-content">
            <h2 id="crear">Crear tu servidor</h2>
            <p>
              En la <Link to="/#calc">página principal</Link> elegís cuánta RAM querés. En el checkout
              completás el nombre del servidor, el tipo (Paper, Vanilla o Forge), la versión de Minecraft,
              tus datos y una contraseña para el panel. Cuando terminás, te mostramos la dirección para
              conectarte, el link al panel y tu usuario.
            </p>
            <p>Paper suele quedar listo en uno o dos minutos. Forge tarda más porque descarga muchas librerías en la instalación.</p>

            <h2 id="panel">Entrar al panel</h2>
            <p>
              Entrás con el email y la contraseña que pusiste en el checkout. El panel está en inglés: las
              secciones que más vas a usar son <strong>Console</strong> (prender, apagar y mandar comandos),
              <strong> Files</strong> (archivos del servidor) y <strong>Schedules</strong> (tareas
              programadas, como un reinicio todas las noches).
            </p>

            <h2 id="conectar">Conectarte desde Minecraft</h2>
            <p>
              Abrí Minecraft Java, andá a <strong>Multijugador → Agregar servidor</strong> y pegá la
              dirección que te dimos al terminar la compra. Tiene la forma <code>IP:puerto</code>, por ejemplo
              {" "}<code>203.0.113.24:25567</code>. Si la perdiste, también aparece en el panel, en la consola,
              bajo <strong>Address</strong>.
            </p>

            <h2 id="op">Darte permisos de operador</h2>
            <p>En la consola del panel escribí el comando sin la barra y apretá Enter:</p>
            <pre>op TuNombreDeMinecraft</pre>
            <p>Con eso podés usar comandos como <code>/gamemode</code> o <code>/tp</code> desde el juego.</p>

            <h2 id="propiedades">Cambiar la configuración</h2>
            <p>
              Casi todo se configura en el archivo <code>server.properties</code>. Entrá a Files, abrilo,
              cambiá lo que necesites y guardá. Los cambios se aplican cuando reiniciás el servidor.
              Algunos valores útiles:
            </p>
            <pre>{`difficulty=normal      # peaceful, easy, normal, hard
gamemode=survival      # survival, creative, adventure
pvp=true
white-list=false       # true para que solo entren los que agregues`}</pre>
            <p>El puerto y la IP los maneja el panel: si los cambiás a mano, se vuelven a poner solos al reiniciar.</p>

            <h2 id="plugins">Subir plugins o mods</h2>
            <p>
              Con Paper, los plugins (<code>.jar</code>) van en la carpeta <code>plugins</code>. Con Forge,
              los mods van en <code>mods</code>. En Files entrás a la carpeta, tocás <strong>Upload</strong>,
              elegís los archivos y reiniciás el servidor. Para modpacks completos, mirá la
              guía de <Link to="/modpacks">modpacks</Link>.
            </p>

            <h2 id="mundo">Subir un mundo propio</h2>
            <p>
              Apagá el servidor, borrá la carpeta <code>world</code>, subí tu mundo comprimido en .zip y usá
              {" "}<strong>Unarchive</strong> para descomprimirlo. La carpeta tiene que llamarse
              {" "}<code>world</code> (o cambiá <code>level-name</code> en <code>server.properties</code>).
              Si venís de otro host, la guía para <Link to="/migrar">migrar</Link> tiene todos los pasos.
            </p>

            <h2 id="ayuda">Si algo no anda</h2>
            <p>
              Primero fijate en la consola: si el servidor se cae, casi siempre el último mensaje en rojo
              dice por qué. Si no lo podés resolver, abrí un ticket en nuestro Discord y pegá ese mensaje.
              También podés ver el <Link to="/status">estado del servicio</Link>.
            </p>
          </article>
        </div>
      </div>
    </>
  );
}
