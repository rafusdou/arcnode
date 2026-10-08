import { useApp } from "../context/AppContext.jsx";

export default function Faq() {
  const { t } = useApp();
  return (
    <section className="faq" id="faq">
      <div className="faq-inner">
        <h2>{t.faq.title}</h2>
        <div className="faq-list">
          {t.faq.items.map((it) => (
            <details key={it.q}>
              <summary>{it.q}</summary>
              <p>{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
