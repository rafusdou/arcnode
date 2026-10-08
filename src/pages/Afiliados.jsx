import PageHeader from "../components/PageHeader.jsx";

export default function Afiliados() {
  return (
    <>
      <PageHeader
        eyebrow="Referidos"
        title="El programa de referidos todavía no está abierto."
        sub="Lo estamos armando. Si tenés una comunidad o un canal y te interesa recomendar ArcNode, escribinos por Discord."
      />
      <div className="page-section">
        <div className="legal-content">
          <h2>Cómo va a funcionar</h2>
          <p>
            Cada persona va a tener un código propio. Cuando alguien contrate un plan pago con ese código,
            quien lo recomendó recibe crédito para usar en su propio servidor. Los detalles (cuánto crédito
            y desde cuándo) los vamos a publicar acá cuando esté listo.
          </p>
          <h2>Mientras tanto</h2>
          <p>
            Si querés ser de los primeros, mandanos un mensaje por Discord contándonos qué comunidad o
            canal tenés.
          </p>
        </div>
      </div>
    </>
  );
}
