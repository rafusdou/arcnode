import PageHeader from "../components/PageHeader.jsx";

export default function Privacidad() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Política de Privacidad" sub="Última actualización: 27 de septiembre de 2026" />
      <div className="page-section">
        <div className="legal-toc" style={{ maxWidth: 760, margin: "0 auto 32px" }}>
          <h4>Contenido</h4>
          <a href="#a">1. Qué datos recopilamos</a>
          <a href="#b">2. Cómo los usamos</a>
          <a href="#c">3. Con quién los compartimos</a>
          <a href="#d">4. Tus derechos</a>
          <a href="#e">5. Cookies</a>
          <a href="#f">6. Contacto</a>
        </div>
        <div className="legal-content">
          <h2 id="a">1. Qué datos recopilamos</h2>
          <p>Email, nombre, datos de facturación (DNI, dirección si pagás por transferencia), teléfono para alertas por WhatsApp, IPs de conexión, y datos de tus servidores (configs, mundos, logs). Nada más.</p>
          <h2 id="b">2. Cómo los usamos</h2>
          <p>Para brindarte el servicio, facturarte, avisarte por WhatsApp si tu servidor se cae, y mejorar el producto. Nunca para publicidad de terceros.</p>
          <h2 id="c">3. Con quién los compartimos</h2>
          <p>Nadie, salvo proveedores estrictamente necesarios: MercadoPago/Stripe (pagos), Evolution API (alertas WhatsApp), Uptime Robot (monitoreo). Todos con acuerdos de procesamiento.</p>
          <h2 id="d">4. Tus derechos</h2>
          <p>Podés acceder, exportar, corregir o eliminar tus datos en cualquier momento desde el panel o escribiendo a privacy@arcnode.cc.</p>
          <h2 id="e">5. Cookies</h2>
          <p>Usamos cookies técnicas (sesión, preferencias). Sin tracking de terceros, sin Google Analytics.</p>
          <h2 id="f">6. Contacto</h2>
          <p>Cualquier duda: <strong>privacy@arcnode.cc</strong>. Respondemos en menos de 48hs.</p>
        </div>
      </div>
    </>
  );
}
