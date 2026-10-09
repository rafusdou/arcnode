import { useCallback, useEffect, useRef, useState } from "react";
import { LogoMark } from "../components/Logo.jsx";
import "./admin.css";

// Admin dashboard: how the core machine and every Minecraft server are doing.
// All numbers come from the metrics agent on the core (agent/index.js) via
// /api/admin/metrics; nothing here is estimated or made up. The password is
// the agent's METRICS_TOKEN and only lives in this tab's sessionStorage.

const REFRESH_MS = 15 * 1000;
const TOKEN_KEY = "changuihost-admin-token";
const RANGES = [
  { key: "1h", label: "1 h" },
  { key: "24h", label: "24 h" },
  { key: "7d", label: "7 días" },
];

const storage = {
  get: () => { try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (v) => { try { sessionStorage.setItem(TOKEN_KEY, v); } catch {} },
  clear: () => { try { sessionStorage.removeItem(TOKEN_KEY); } catch {} },
};

// ---------- Formatting ----------

const nf = (digits) => new Intl.NumberFormat("es-AR", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
const UNITS = ["B", "KB", "MB", "GB", "TB"];

function fmtBytes(b, digits = 1) {
  if (b == null) return "—";
  let i = 0;
  while (Math.abs(b) >= 1024 && i < UNITS.length - 1) { b /= 1024; i++; }
  return `${nf(i >= 3 ? digits : 0).format(b)} ${UNITS[i]}`;
}
const fmtRate = (b) => (b == null ? "—" : `${fmtBytes(b)}/s`);
const fmtPct = (p, digits = 0) => (p == null ? "—" : `${nf(digits).format(p)} %`);

function fmtDuration(ms) {
  if (ms == null) return "—";
  const min = Math.floor(ms / 60000);
  if (min < 1) return "menos de 1 min";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ${min % 60} min`;
  return `${Math.floor(h / 24)} d ${h % 24} h`;
}

function fmtTime(t, range) {
  const d = new Date(t);
  const hm = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
  if (range !== "7d") return hm;
  return `${d.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "")} ${hm}`;
}

const pct = (used, total) => (used != null && total ? (100 * used) / total : null);

// Status levels for meters: always shown with a word, never color alone.
function level(p) {
  if (p == null) return { cls: "", word: "" };
  if (p >= 90) return { cls: "is-bad", word: "crítico" };
  if (p >= 75) return { cls: "is-warn", word: "alto" };
  return { cls: "", word: "" };
}

const STATES = {
  running: { label: "Prendido", cls: "ok" },
  starting: { label: "Arrancando", cls: "warn" },
  stopping: { label: "Apagándose", cls: "warn" },
  offline: { label: "Apagado", cls: "off" },
  installing: { label: "Instalando", cls: "warn" },
  suspended: { label: "Suspendido", cls: "bad" },
  unknown: { label: "Sin datos", cls: "off" },
};

// ---------- Pieces ----------

// `plain` skips the warning colors: a Minecraft server sitting at its RAM
// limit is normal (Java takes the whole heap up front), not a problem.
function Meter({ value, plain }) {
  const lv = plain ? level(null) : level(value);
  return (
    <div className={"adm-meter " + lv.cls} role="presentation">
      <span style={{ width: `${Math.min(100, value || 0)}%` }} />
    </div>
  );
}

function Tile({ label, value, sub, meter }) {
  const lv = level(meter);
  return (
    <div className="adm-tile">
      <div className="adm-tile-label">{label}</div>
      <div className="adm-tile-value">
        {value}
        {lv.word && <span className={"adm-flag " + lv.cls}>▲ {lv.word}</span>}
      </div>
      {meter !== undefined && <Meter value={meter} />}
      {sub && <div className="adm-tile-sub">{sub}</div>}
    </div>
  );
}

function niceMax(v, integer) {
  if (!v || v <= 0) return integer ? 2 : 1;
  const mag = 10 ** Math.floor(Math.log10(v));
  let top = [1, 2, 4, 5, 10].map((m) => m * mag).find((c) => c >= v);
  if (integer) top = Math.max(2, Math.ceil(top / 2) * 2);
  return top;
}

// Same idea in the 1024 steps fmtBytes uses, so the axis reads "2 MB/s"
// instead of "977 KB/s".
function niceBytes(v) {
  if (!v || v <= 0) return 1024;
  const unit = 1024 ** Math.floor(Math.log(v) / Math.log(1024));
  return niceMax(v / unit) * unit;
}

// Line chart on one y-axis, with a crosshair that snaps to the nearest
// sample. Gaps in the data (agent off) are drawn as gaps.
function LineChart({ points, series, top, yFmt, range, area }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const H = 190;
  const pad = { l: 64, r: 10, t: 12, b: 26 };
  const plotW = Math.max(10, width - pad.l - pad.r);
  const plotH = H - pad.t - pad.b;
  const n = points.length;
  const x = (i) => pad.l + (n <= 1 ? 0 : (i / (n - 1)) * plotW);
  const y = (v) => pad.t + plotH - (Math.min(v, top) / top) * plotH;

  const segments = (key) => {
    const segs = [];
    let cur = [];
    points.forEach((p, i) => {
      if (p[key] == null) { if (cur.length) segs.push(cur); cur = []; }
      else cur.push([x(i), y(p[key])]);
    });
    if (cur.length) segs.push(cur);
    return segs;
  };

  const line = (seg) => seg.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join("");
  const base = pad.t + plotH;

  const xTicks = width < 460 ? [0, Math.floor((n - 1) / 2), n - 1] : [0, Math.floor((n - 1) / 4), Math.floor((n - 1) / 2), Math.floor((3 * (n - 1)) / 4), n - 1];

  const indexAt = (clientX) => {
    const r = wrapRef.current.getBoundingClientRect();
    const i = Math.round(((clientX - r.left - pad.l) / plotW) * (n - 1));
    return Math.max(0, Math.min(n - 1, i));
  };

  const lastWithData = () => {
    for (let i = n - 1; i >= 0; i--) if (series.some((s) => points[i][s.key] != null)) return i;
    return n - 1;
  };

  const onKey = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setHover((h) => Math.max(0, Math.min(n - 1, (h ?? lastWithData()) + (e.key === "ArrowLeft" ? -1 : 1))));
  };

  const hp = hover != null ? points[hover] : null;
  const tipLeft = hover != null ? Math.min(Math.max(x(hover), 90), width - 90) : 0;

  return (
    <div
      ref={wrapRef}
      className="adm-chart"
      tabIndex={0}
      onPointerMove={(e) => setHover(indexAt(e.clientX))}
      onPointerLeave={() => setHover(null)}
      onFocus={() => setHover(lastWithData())}
      onBlur={() => setHover(null)}
      onKeyDown={onKey}
    >
      <svg width={width} height={H} role="img" aria-label={series.map((s) => s.label).join(", ")}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={pad.l} x2={pad.l + plotW} y1={y(f * top)} y2={y(f * top)} className="adm-grid" />
            <text x={pad.l - 8} y={y(f * top)} dy="0.32em" textAnchor="end" className="adm-axis">{yFmt(f * top)}</text>
          </g>
        ))}
        {xTicks.map((i, k) => (
          <text
            key={k}
            x={x(i)}
            y={H - 6}
            textAnchor={k === 0 ? "start" : k === xTicks.length - 1 ? "end" : "middle"}
            className="adm-axis"
          >
            {fmtTime(points[i].t, range)}
          </text>
        ))}
        {series.map((s) =>
          segments(s.key).map((seg, k) => (
            <g key={s.key + k}>
              {area && seg.length > 1 && (
                <path d={`${line(seg)}L${seg[seg.length - 1][0]},${base}L${seg[0][0]},${base}Z`} style={{ fill: s.color }} className="adm-area" />
              )}
              {seg.length === 1
                ? <circle cx={seg[0][0]} cy={seg[0][1]} r="2" style={{ fill: s.color }} />
                : <path d={line(seg)} style={{ stroke: s.color }} className="adm-line" />}
            </g>
          )),
        )}
        {hp && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={base} className="adm-cross" />
            {series.map((s) => hp[s.key] != null && (
              <circle key={s.key} cx={x(hover)} cy={y(hp[s.key])} r="4" style={{ fill: s.color }} className="adm-dot" />
            ))}
          </g>
        )}
      </svg>
      {hp && (
        <div className="adm-tip" style={{ left: tipLeft }}>
          <div className="adm-tip-time">{fmtTime(hp.t, range)}</div>
          {series.map((s) => (
            <div key={s.key} className="adm-tip-row">
              <span className="adm-key" style={{ background: s.color }} />
              <strong>{hp[s.key] == null ? "sin datos" : s.fmt(hp[s.key])}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, sub, legend, children }) {
  return (
    <section className="adm-card">
      <div className="adm-card-head">
        <div>
          <h3>{title}</h3>
          {sub && <p>{sub}</p>}
        </div>
        {legend && (
          <div className="adm-legend">
            {legend.map((l) => (
              <span key={l.label}><span className="adm-key" style={{ background: l.color }} />{l.label}</span>
            ))}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

// ---------- Login ----------

function Login({ onLogin, error, busy }) {
  const [value, setValue] = useState("");
  return (
    <div className="adm-login">
      <form
        className="adm-login-box"
        onSubmit={(e) => { e.preventDefault(); if (value.trim()) onLogin(value.trim()); }}
      >
        <div className="adm-brand"><LogoMark size={28} /> Changuihost <span className="adm-badge">Admin</span></div>
        <label htmlFor="adm-pass">Contraseña de administrador</label>
        <input id="adm-pass" type="password" autoComplete="current-password" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
        {error && <p className="adm-error">{error}</p>}
        <button type="submit" className="adm-btn" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
        <p className="adm-hint">Es el valor de <code>METRICS_TOKEN</code> en el archivo <code>.env</code>.</p>
      </form>
    </div>
  );
}

// ---------- Page ----------

export default function Admin() {
  const [token, setToken] = useState(storage.get);
  const [range, setRange] = useState("24h");
  const [data, setData] = useState(null);
  const [problem, setProblem] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    const prevTitle = document.title;
    document.title = "Admin · Changuihost";
    return () => { meta.remove(); document.title = prevTitle; };
  }, []);

  const load = useCallback(async (tok, rng) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/metrics?range=${rng}`, { headers: { Authorization: `Bearer ${tok}` } });
      if (res.status === 401) {
        storage.clear();
        setToken(null);
        setData(null);
        setLoginError("Contraseña incorrecta.");
        return;
      }
      if (res.status === 503) return setProblem("El agente recién arrancó. En unos segundos aparecen los datos.");
      if (!res.ok) return setProblem("El agente de métricas no responde. Revisá que la máquina core esté prendida y que el agente esté corriendo.");
      const json = await res.json();
      storage.set(tok);
      setLoginError(null);
      setProblem(null);
      setData(json);
    } catch {
      setProblem("No hay conexión con el backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    load(token, range);
    const id = setInterval(() => load(token, range), REFRESH_MS);
    return () => clearInterval(id);
  }, [token, range, load]);

  // Keeps "actualizado hace X s" honest between refreshes.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  if (!token) return <Login onLogin={(t) => { setToken(t); }} error={loginError} busy={loading} />;

  const logout = () => { storage.clear(); setToken(null); setData(null); };

  return (
    <div className="adm">
      <header className="adm-top">
        <div className="adm-brand"><LogoMark size={26} /> Changuihost <span className="adm-badge">Admin</span></div>
        <div className="adm-top-right">
          {data && <span className="adm-updated">Actualizado hace {Math.max(0, Math.round((Date.now() - data.at) / 1000))} s</span>}
          <button className="adm-btn-ghost" onClick={logout}>Salir</button>
        </div>
      </header>

      <main className="adm-main">
        {problem && <div className="adm-banner" role="status">⚠ {problem}</div>}
        {!data ? (
          !problem && <p className="adm-muted">Cargando métricas…</p>
        ) : (
          <Dashboard data={data} range={range} setRange={setRange} stale={loading || !!problem} />
        )}
      </main>
    </div>
  );
}

function Dashboard({ data, range, setRange, stale }) {
  const { host, node, servers, totals, history, panel } = data;
  const s = history.summary;
  const memPct = pct(host.mem.used, host.mem.total);
  const diskPct = pct(host.disk?.used, host.disk?.total);
  const pts = history.points;

  const netTop = niceBytes(Math.max(...pts.flatMap((p) => [p.rx || 0, p.tx || 0])));
  const playersTop = niceMax(Math.max(...pts.map((p) => p.players || 0)), true);

  const sorted = [...servers].sort((a, b) =>
    (b.state === "running") - (a.state === "running") || (b.mem || 0) - (a.mem || 0));

  return (
    <div className={stale ? "adm-stale" : ""}>
      <div className="adm-host">
        <div>
          <h1>{host.hostname}</h1>
          <p>
            {host.os} · {host.cpuModel} · {host.cores} núcleos · encendida hace {fmtDuration(host.uptimeSec * 1000)}
          </p>
        </div>
        <span className={"adm-pill " + (panel === "up" ? "ok" : "bad")}>
          <span className="adm-dot-s" />{panel === "up" ? "Panel funcionando" : "Panel sin respuesta"}
        </span>
      </div>

      <h2 className="adm-h2">Ahora</h2>
      <div className="adm-tiles">
        <Tile
          label="CPU"
          value={fmtPct(host.cpu)}
          meter={host.cpu}
          sub={`Carga ${host.load.map((l) => nf(2).format(l)).join(" / ")} (1, 5 y 15 min)`}
        />
        <Tile label="RAM" value={fmtBytes(host.mem.used)} meter={memPct} sub={`de ${fmtBytes(host.mem.total)} · ${fmtPct(memPct)}`} />
        <Tile label="Disco" value={fmtBytes(host.disk?.used)} meter={diskPct} sub={`de ${fmtBytes(host.disk?.total)} · ${fmtPct(diskPct)}`} />
        <Tile label="Red" value={<>↓ {fmtRate(host.net?.rx)}</>} sub={`↑ ${fmtRate(host.net?.tx)} de subida`} />
        <Tile label="Servidores prendidos" value={`${totals.running} de ${totals.servers}`} sub={`${servers.filter((x) => x.free).length} gratis · ${servers.filter((x) => !x.free).length} pagos`} />
        <Tile label="Jugadores conectados" value={nf(0).format(totals.players)} sub="Sumando todos los servidores" />
      </div>

      {node && (
        <>
          <h2 className="adm-h2">Capacidad del nodo <span>{node.name}</span></h2>
          <div className="adm-tiles adm-tiles-2">
            <CapacityTile label="RAM asignada a servidores" res={node.memory} />
            <CapacityTile label="Disco asignado a servidores" res={node.disk} />
          </div>
        </>
      )}

      <div className="adm-range-row">
        <h2 className="adm-h2">Historial</h2>
        <div className="adm-seg" role="group" aria-label="Período">
          {RANGES.map((r) => (
            <button key={r.key} className={range === r.key ? "on" : ""} aria-pressed={range === r.key} onClick={() => setRange(r.key)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-tiles adm-summary">
        <Tile label="CPU promedio" value={fmtPct(s.cpuAvg)} sub={`Pico: ${fmtPct(s.cpuPeak)}`} />
        <Tile label="RAM promedio" value={fmtBytes(s.memAvg)} sub={`Pico: ${fmtBytes(s.memPeak)}`} />
        <Tile label="Descargado" value={fmtBytes(s.rxTotal)} sub={`Subido: ${fmtBytes(s.txTotal)}`} />
        <Tile label="Pico de jugadores" value={s.playersPeak == null ? "—" : nf(0).format(s.playersPeak)} sub={`Pico de servidores prendidos: ${s.runningPeak ?? "—"}`} />
      </div>
      <p className="adm-muted adm-coverage">
        {s.since
          ? <>Hay datos del {fmtPct(Math.min(100, s.coverage * 100))} de este período. Se mide desde el {new Date(s.since).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}; los huecos son momentos en que la máquina o el agente estaban apagados.</>
          : <>Todavía no hay historial: el agente guarda un punto por minuto.</>}
      </p>

      <div className="adm-charts">
        <ChartCard title="CPU" sub="Uso de todos los núcleos, en %">
          <LineChart points={pts} range={range} top={100} yFmt={(v) => `${v} %`} area
            series={[{ key: "cpu", label: "CPU", color: "var(--c-line)", fmt: (v) => fmtPct(v, 1) }]} />
        </ChartCard>
        <ChartCard title="RAM" sub={`Usada, sobre ${fmtBytes(host.mem.total)} en total`}>
          <LineChart points={pts} range={range} top={host.mem.total} yFmt={(v) => fmtBytes(v, 0)} area
            series={[{ key: "mem", label: "RAM usada", color: "var(--c-line)", fmt: (v) => fmtBytes(v) }]} />
        </ChartCard>
        <ChartCard
          title="Red"
          sub="Tráfico de la máquina"
          legend={[{ label: "Bajada", color: "var(--c-rx)" }, { label: "Subida", color: "var(--c-tx)" }]}
        >
          <LineChart points={pts} range={range} top={netTop} yFmt={(v) => fmtRate(v)}
            series={[
              { key: "rx", label: "Bajada", color: "var(--c-rx)", fmt: fmtRate },
              { key: "tx", label: "Subida", color: "var(--c-tx)", fmt: fmtRate },
            ]} />
        </ChartCard>
        <ChartCard title="Jugadores conectados" sub="Máximo de cada intervalo, todos los servidores">
          <LineChart points={pts} range={range} top={playersTop} yFmt={(v) => nf(0).format(v)} area
            series={[{ key: "players", label: "Jugadores", color: "var(--c-line)", fmt: (v) => nf(0).format(v) }]} />
        </ChartCard>
      </div>

      <details className="adm-table-view">
        <summary>Ver el historial en tabla</summary>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Hora</th><th>CPU</th><th>RAM</th><th>Bajada</th><th>Subida</th><th>Jugadores</th></tr>
            </thead>
            <tbody>
              {pts.filter((p) => p.cpu != null).reverse().map((p) => (
                <tr key={p.t}>
                  <td>{fmtTime(p.t, range)}</td>
                  <td>{fmtPct(p.cpu, 1)}</td>
                  <td>{fmtBytes(p.mem)}</td>
                  <td>{fmtRate(p.rx)}</td>
                  <td>{fmtRate(p.tx)}</td>
                  <td>{p.players ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <h2 className="adm-h2">Servidores <span>{servers.length}</span></h2>
      {servers.length === 0 ? (
        <p className="adm-muted">No hay servidores creados en el panel.</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table adm-servers">
            <thead>
              <tr>
                <th>Servidor</th><th>Estado</th><th>CPU</th><th>RAM</th><th>Disco</th><th>Jugadores</th><th>Prendido hace</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((sv) => {
                const st = STATES[sv.state] || STATES.unknown;
                const memP = pct(sv.mem, sv.memLimit);
                return (
                  <tr key={sv.id}>
                    <td>
                      <div className="adm-sv-name">{sv.name}{sv.free && <span className="adm-tag">Gratis</span>}</div>
                      <div className="adm-sv-sub">{sv.plan ? `Plan ${sv.plan}` : "Sin plan"} · {sv.owner || "—"}{sv.port ? ` · :${sv.port}` : ""}</div>
                    </td>
                    <td><span className={"adm-state " + st.cls}><span className="adm-dot-s" />{st.label}</span></td>
                    <td>{sv.cpu == null ? "—" : `${fmtPct(sv.cpu, 1)}`}<div className="adm-sv-sub">límite {sv.cpuLimit ? `${sv.cpuLimit} %` : "sin límite"}</div></td>
                    <td className="adm-td-meter">
                      {fmtBytes(sv.mem)} <span className="adm-sv-sub">/ {fmtBytes(sv.memLimit)}</span>
                      {sv.mem != null && <Meter value={memP} plain />}
                    </td>
                    <td>{fmtBytes(sv.disk)} <span className="adm-sv-sub">/ {sv.diskLimit ? fmtBytes(sv.diskLimit) : "∞"}</span></td>
                    <td>{sv.players ? `${sv.players.online}${sv.players.max ? ` / ${sv.players.max}` : ""}` : "—"}</td>
                    <td>{sv.state === "running" ? fmtDuration(sv.uptimeMs) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CapacityTile({ label, res }) {
  const limit = res.total * (1 + Math.max(0, res.overallocate) / 100);
  const p = pct(res.allocated, limit);
  return (
    <Tile
      label={label}
      value={`${fmtBytes(res.allocated)} de ${fmtBytes(limit)}`}
      meter={p}
      sub={`${fmtPct(p)} vendido · quedan ${fmtBytes(Math.max(0, limit - res.allocated))} para servidores nuevos`}
    />
  );
}
