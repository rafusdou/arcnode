import PageHeader from "../components/PageHeader.jsx";

export default function Terminos() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Términos y Condiciones" sub="Última actualización: 27 de septiembre de 2026" />
      <div className="page-section">
        <div className="legal-toc" style={{ maxWidth: 760, margin: "0 auto 32px" }}>
          <h4>Contenido</h4>
          <a href="#a">1. Aceptación de términos</a>
          <a href="#b">2. Servicio</a>
          <a href="#c">3. Pagos y facturación</a>
          <a href="#d">4. Uso aceptable</a>
          <a href="#e">5. Suspensión y terminación</a>
          <a href="#f">6. Limitación de responsabilidad</a>
        </div>
        <div className="legal-content">
          <h2 id="a">1. Aceptación de términos</h2>
          <p>Al usar ArcNode (el "Servicio") aceptás estos términos. Si no estás de acuerdo, no podés usar el Servicio. Te avisamos por email si los modificamos.</p>
          <h2 id="b">2. Servicio</h2>
          <p>ArcNode brinda hosting de servidores de Minecraft y servicios relacionados. No somos Mojang ni Microsoft. Minecraft® es marca de Mojang AB.</p>
          <h2 id="c">3. Pagos y facturación</h2>
          <p>Los planes son prepagos por mes, a $2 USD por GB de RAM. Aceptamos MercadoPago (ARS) y Stripe (USD). Garantía de devolución de 14 días desde el primer pago.</p>
          <h2 id="d">4. Uso aceptable</h2>
          <p>No podés usar ArcNode para:</p>
          <ul>
            <li>Distribuir contenido ilegal, malware, o phishing</li>
            <li>Atacar otros servidores (DDoS, scanning, spam)</li>
            <li>Hostear contenido que viole copyright sin autorización</li>
            <li>Minería de criptomonedas en planes compartidos</li>
          </ul>
          <h2 id="e">5. Suspensión y terminación</h2>
          <p>Podemos suspender el servicio si detectamos abuso. Te damos aviso de 24hs salvo en casos críticos (ataques activos). Tus datos se conservan 30 días después de cancelación.</p>
          <h2 id="f">6. Limitación de responsabilidad</h2>
          <p>No nos hacemos responsables por pérdida de mundos si no hiciste backup. Hacemos backups automáticos en planes pagos (verificados mensualmente) pero recomendamos descargas periódicas.</p>
        </div>
      </div>
    </>
  );
}
