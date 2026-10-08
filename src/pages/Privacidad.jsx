import PageHeader from "../components/PageHeader.jsx";

const SECTIONS = [
  ["a", "Qué datos guardamos"],
  ["b", "Para qué los usamos"],
  ["c", "Con quién los compartimos"],
  ["d", "Tus derechos"],
  ["e", "Cookies"],
  ["f", "Contacto"],
];

export default function Privacidad() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Política de privacidad" sub="Última actualización: 8 de octubre de 2026" />
      <div className="page-section">
        <div className="legal-toc">
          <h4>Contenido</h4>
          {SECTIONS.map(([id, label], i) => <a key={id} href={`#${id}`}>{i + 1}. {label}</a>)}
        </div>
        <div className="legal-content">
          <h2 id="a">1. Qué datos guardamos</h2>
          <ul>
            <li>El nombre, el apellido y el email que cargás al crear tu servidor.</li>
            <li>La contraseña del panel. Se guarda cifrada: nadie, ni siquiera nosotros, puede leerla.</li>
            <li>Los archivos, la configuración y los registros (logs) de tu servidor.</li>
            <li>La IP desde la que entrás al panel, que el panel registra por seguridad.</li>
          </ul>
          <p>Los datos de tu tarjeta no se guardan en ArcNode.</p>

          <h2 id="b">2. Para qué los usamos</h2>
          <p>
            Para crear y mantener tu cuenta y tu servidor, darte soporte y avisarte de cambios importantes
            en el servicio. No vendemos tus datos ni los usamos para publicidad.
          </p>

          <h2 id="c">3. Con quién los compartimos</h2>
          <p>Solo con quienes necesitamos para que el servicio funcione:</p>
          <ul>
            <li>Los proveedores de infraestructura que alojan el sitio y los servidores.</li>
            <li>El procesador de pagos, cuando pagás un plan.</li>
            <li>Discord, si abrís un ticket de soporte (ahí aplica también la política de privacidad de Discord).</li>
          </ul>

          <h2 id="d">4. Tus derechos</h2>
          <p>
            Podés pedirnos ver, corregir o borrar tus datos en cualquier momento, como establece la Ley
            25.326 de Protección de Datos Personales. Si considerás que no respetamos tus derechos, podés
            hacer un reclamo ante la Agencia de Acceso a la Información Pública (AAIP), que es el
            organismo de control de esa ley.
          </p>

          <h2 id="e">5. Cookies</h2>
          <p>
            Este sitio no usa cookies de seguimiento ni herramientas de análisis. El panel usa cookies de
            sesión para que no tengas que iniciar sesión cada vez.
          </p>

          <h2 id="f">6. Contacto</h2>
          <p>Para cualquier pedido sobre tus datos, abrí un ticket en nuestro Discord.</p>
        </div>
      </div>
    </>
  );
}
