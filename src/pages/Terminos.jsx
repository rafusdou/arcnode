import PageHeader from "../components/PageHeader.jsx";

const SECTIONS = [
  ["a", "Aceptación"],
  ["b", "El servicio"],
  ["c", "Planes y pagos"],
  ["d", "Plan gratis"],
  ["e", "Uso aceptable"],
  ["f", "Suspensión y cancelación"],
  ["g", "Copias de seguridad y responsabilidad"],
  ["h", "Cambios en estos términos"],
];

export default function Terminos() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Términos y condiciones" sub="Última actualización: 8 de octubre de 2026" />
      <div className="page-section">
        <div className="legal-toc">
          <h4>Contenido</h4>
          {SECTIONS.map(([id, label], i) => <a key={id} href={`#${id}`}>{i + 1}. {label}</a>)}
        </div>
        <div className="legal-content">
          <h2 id="a">1. Aceptación</h2>
          <p>Al crear un servidor en ArcNode aceptás estos términos. Si no estás de acuerdo con ellos, no uses el servicio.</p>

          <h2 id="b">2. El servicio</h2>
          <p>
            ArcNode ofrece hosting de servidores de Minecraft Java Edition, administrados desde un panel
            de control. No somos parte de Mojang ni de Microsoft. Minecraft es una marca de Mojang AB.
          </p>

          <h2 id="c">3. Planes y pagos</h2>
          <p>
            Los planes pagos se cobran por adelantado, según el ciclo que elijas al pagar: mensual,
            trimestral o anual. El precio es de $1,80 USD por GB de RAM, con los descuentos por ciclo que
            se muestran en el checkout. Los precios en pesos se calculan con un tipo de cambio de
            referencia y pueden actualizarse; el precio que pagás es el que figura al momento de la compra.
          </p>
          <p>Si no quedás conforme, podés pedir la devolución dentro de los 14 días corridos desde el primer pago.</p>

          <h2 id="d">4. Plan gratis</h2>
          <p>
            El plan gratis es para probar el servicio y tiene recursos limitados. Los servidores del plan
            gratis pueden mostrar mensajes de ArcNode y de patrocinadores en el chat del juego y en la
            lista de servidores, y se apagan automáticamente cuando no hay jugadores conectados. Se puede
            tener un servidor gratis por persona. Podemos cambiar las condiciones del plan gratis o dejar
            de ofrecerlo, avisando con anticipación.
          </p>

          <h2 id="e">5. Uso aceptable</h2>
          <p>No podés usar ArcNode para:</p>
          <ul>
            <li>Distribuir contenido ilegal, malware o phishing.</li>
            <li>Atacar otros servidores o redes (DDoS, escaneo de puertos, spam).</li>
            <li>Alojar contenido que infrinja derechos de autor.</li>
            <li>Minar criptomonedas o correr cualquier cosa que no sea un servidor de Minecraft.</li>
          </ul>

          <h2 id="f">6. Suspensión y cancelación</h2>
          <p>
            Podemos suspender un servidor si se usa en contra de estos términos. Salvo casos urgentes, como
            un ataque en curso, te avisamos antes. Si cancelás tu plan o no lo renovás, guardamos los
            archivos del servidor durante 30 días por si querés descargarlos; después se borran.
          </p>

          <h2 id="g">7. Copias de seguridad y responsabilidad</h2>
          <p>
            Los planes que incluyen backups permiten crear copias desde el panel. Igual te recomendamos
            descargar una copia de tu mundo cada tanto. Hacemos lo posible para que el servicio funcione
            sin cortes, pero no nos hacemos responsables por pérdidas de datos.
          </p>

          <h2 id="h">8. Cambios en estos términos</h2>
          <p>Si cambiamos estos términos, lo avisamos en nuestro Discord y actualizamos la fecha de esta página.</p>
        </div>
      </div>
    </>
  );
}
