import { useApp } from "../context/AppContext.jsx";

export default function Features() {
  const { t } = useApp();
  return (
    <section className="includes" id="features">
      <div className="includes-inner">
        <div className="includes-intro">
          <h2>{t.includes.title}</h2>
          <p>{t.includes.intro}</p>
        </div>
        <dl className="includes-list">
          {t.includes.items.map((it) => (
            <div key={it.t}>
              <dt>{it.t}</dt>
              <dd>{it.d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
