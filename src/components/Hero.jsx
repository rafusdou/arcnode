import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";

function Stat({ label, value, bar, color }) {
  return (
    <div className="stat">
      <div className="stat-row">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
      <div className="stat-bar">
        <div className="stat-fill" style={{ width: bar + "%", background: color }} />
      </div>
    </div>
  );
}

function ServerPreview({ t }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((x) => x + 1), 1800);
    return () => clearInterval(i);
  }, []);
  const colors = ["#5DCAA5", "#94a3b8", "#94a3b8", "#378ADD", "#94a3b8", "#1D9E75"];
  const times = ["16:42:01", "16:42:14", "16:42:29", "16:42:31", "16:42:47", "16:43:02"];
  const lines = t.hero.log
    .map((txt, i) => ({ t: times[i], c: colors[i], txt }))
    .slice(0, Math.min(6, 2 + (tick % 5)));

  return (
    <div className="server-preview">
      <div className="sp-titlebar">
        <div className="sp-dots"><span /><span /><span /></div>
        <div className="sp-host">
          <span className="sp-status"><span className="dot pulse" /></span>
          <span className="sp-domain">{t.hero.preview.domain}</span>
          <span className="sp-meta">{t.hero.preview.meta}</span>
        </div>
      </div>
      <div className="sp-stats">
        <Stat label="CPU" value="14%" bar={14} color="#378ADD" />
        <Stat label="RAM" value="4.2 / 12 GB" bar={35} color="#1D9E75" />
        <Stat label="TPS" value="20.0" bar={100} color="#5DCAA5" />
      </div>
      <div className="sp-console">
        {lines.map((l, i) => (
          <div className="sp-line" key={i + l.txt} style={{ animationDelay: i * 0.05 + "s" }}>
            <span className="sp-time">{l.t}</span>
            <span style={{ color: l.c }}>{l.txt}</span>
          </div>
        ))}
        <div className="sp-cursor">_</div>
      </div>
      <div className="sp-players">
        <span className="sp-players-label">{t.hero.preview.online}</span>
        <div className="sp-avatars">
          {["S", "M", "L"].map((c, i) => (
            <div key={i} className="sp-avatar" style={{ background: ["#378ADD", "#1D9E75", "#5DCAA5"][i] }}>{c}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const { t } = useApp();
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true">
        <div className="grid-overlay" />
        <div className="glow glow-1" />
        <div className="glow glow-2" />
      </div>
      <div className="hero-inner">
        <div className="hero-left">
          <div className="status-pill">
            <span className="dot pulse" />
            <span>{t.hero.pill}</span>
          </div>
          <h1 className="hero-title">
            {t.hero.title1}<span className="gradient-text">{t.hero.title2}</span>{t.hero.title3}
          </h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg">
              {t.hero.ctaPrimary}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
            <button className="btn btn-ghost btn-lg">{t.hero.ctaSecondary}</button>
          </div>
          <div className="hero-trust">
            {t.hero.trust.map((tr, i) => (
              <div className="trust-item-wrap" key={i} style={{ display: "contents" }}>
                <div className="trust-item"><strong>{tr.v}</strong><span>{tr.l}</span></div>
                {i < t.hero.trust.length - 1 && <div className="trust-divider" />}
              </div>
            ))}
          </div>
        </div>
        <div className="hero-right">
          <ServerPreview t={t} />
        </div>
      </div>
    </section>
  );
}
