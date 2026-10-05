import { useApp } from "../context/AppContext.jsx";

const TESTI_COLORS = ["#378ADD", "#5DCAA5", "#1D9E75", "#378ADD"];

export default function Testimonials() {
  const { t } = useApp();
  return (
    <section className="testis" id="testimonios">
      <div className="section-head">
        <div className="eyebrow"><span className="dot" /> {t.testis.eyebrow}</div>
        <h2>{t.testis.title}</h2>
      </div>
      <div className="testi-grid">
        {t.testis.items.map((it, i) => (
          <div className="testi-card" key={i}>
            <div className="rating">
              {Array.from({ length: 5 }).map((_, j) => (
                <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              ))}
            </div>
            <p className="testi-body">{it.body}</p>
            <div className="testi-foot">
              <div className="testi-avatar" style={{ background: TESTI_COLORS[i] }}>{it.name[0]}</div>
              <div>
                <div className="testi-name">{it.name}</div>
                <div className="testi-role">{it.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
