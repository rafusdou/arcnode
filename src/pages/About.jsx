import PageHeader from "../components/PageHeader.jsx";

export default function About() {
  return (
    <>
      <PageHeader eyebrow="Sobre ArcNode" title="Hosting hecho por gente que juega." sub="Empezamos en 2026 desde Buenos Aires porque estábamos cansados de pagar el doble por lag europeo." />
      <div className="page-section">
        <div className="about-stats">
          <div className="about-stat"><div className="about-stat-val">12.847</div><div className="about-stat-label">servidores activos</div></div>
          <div className="about-stat"><div className="about-stat-val">{"<"}30ms</div><div className="about-stat-label">latencia LATAM</div></div>
          <div className="about-stat"><div className="about-stat-val">99.9%</div><div className="about-stat-label">uptime real</div></div>
          <div className="about-stat"><div className="about-stat-val">2026</div><div className="about-stat-label">desde</div></div>
        </div>
        <div className="legal-content" style={{ maxWidth: 760 }}>
          <h2>Nuestra historia</h2>
          <p>Somos un equipo chico en Buenos Aires. Arrancamos por un servidor propio que laggeaba con 10 jugadores en un hosting europeo. Cuando vimos que ningún hosting argentino tenía hardware decente ni precios claros, decidimos hacerlo nosotros: $1,80 USD por GB, sin letra chica.</p>
          <h2>Hardware</h2>
          <p>Todos nuestros nodos corren Ryzen 9 7950X con NVMe Gen4 en RAID. Anti-DDoS a 1.5 Tbps en todos los planes pagos.</p>
          <h2>Compromiso</h2>
          <p>Soporte humano por Discord, onboarding personalizado en las primeras 24hs, y backups que testeamos mensualmente para confirmar que restauran de verdad. Garantía de devolución de 14 días sin preguntas.</p>
        </div>
      </div>
    </>
  );
}
