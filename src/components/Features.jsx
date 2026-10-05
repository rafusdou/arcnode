import { useApp } from "../context/AppContext.jsx";
import Icon from "./Icon.jsx";

const FEATURE_ICONS = ["cpu", "shield", "save", "package", "globe", "terminal", "zap", "users"];

export default function Features() {
  const { t } = useApp();
  return (
    <section className="features" id="features">
      <div className="section-head">
        <div className="eyebrow"><span className="dot" /> {t.features.eyebrow}</div>
        <h2>{t.features.title}</h2>
        <p>{t.features.sub}</p>
      </div>
      <div className="features-grid">
        {t.features.items.map((f, i) => (
          <div className="feature-card" key={i}>
            <div className="feature-icon"><Icon name={FEATURE_ICONS[i]} size={20} /></div>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
