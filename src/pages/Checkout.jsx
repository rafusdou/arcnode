import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ARCNODE_PLANS } from "../data/plans.js";
import { detectCardBrand, formatCardNumber, formatExpiry, isExpiryValid, isValidLength } from "../utils/card.js";

const SERVER_TYPES = [
  { value: "paper", label: "Paper (vanilla optimizado)" },
  { value: "vanilla", label: "Vanilla" },
  { value: "forge", label: "Forge (mods)" },
];

const MC_VERSIONS = ["latest", "1.21.4", "1.20.4", "1.19.4", "1.18.2", "1.16.5"];

function SuccessScreen({ result, isFree }) {
  const [running, setRunning] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const r = await fetch(`/api/checkout/status/${result.server.id}`);
        const data = await r.json();
        if (data.running) {
          setRunning(true);
          clearInterval(pollRef.current);
        }
      } catch {
        /* keep polling */
      }
    };
    poll();
    pollRef.current = setInterval(poll, 4000);
    return () => clearInterval(pollRef.current);
  }, [result.server.id]);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 40px 96px" }}>
      <div className="checkout-card" style={{ textAlign: "center", padding: "40px 32px" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", margin: "0 auto 20px",
          background: "var(--green)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <h1 style={{ fontSize: 26, margin: "0 0 8px" }}>{isFree ? "¡Tu servidor está en camino!" : "¡Pago aprobado!"}</h1>
        <p style={{ color: "var(--muted)", margin: "0 0 32px" }}>
          Tu servidor <strong style={{ color: "var(--text-strong)" }}>{result.server.name}</strong> ({result.server.plan} · {result.server.type} {result.server.version}) ya está siendo creado.
        </p>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px",
          borderRadius: 100, fontSize: 13, fontWeight: 600, marginBottom: 28,
          background: running ? "rgba(29,158,117,0.12)" : "rgba(245,158,11,0.12)",
          color: running ? "var(--green)" : "var(--amber)",
        }}>
          <span className="dot pulse" style={{ background: running ? "var(--green)" : "var(--amber)" }} />
          {running ? "Servidor online — ya podés conectarte" : `Instalando ${result.server.type}…`}
        </div>

        <div style={{ textAlign: "left", display: "grid", gap: 0 }}>
          <div className="summary-line"><span>Conectate en Minecraft a</span><strong style={{ fontFamily: "var(--font-mono)" }}>{result.server.ip}:{result.server.port}</strong></div>
          <div className="summary-line"><span>Panel de administración</span><strong>{result.panel.url}</strong></div>
          <div className="summary-line"><span>Usuario del panel</span><strong>{result.panel.username}</strong></div>
          <div className="summary-line"><span>Email</span><strong>{result.panel.email}</strong></div>
          <div className="summary-line"><span>Contraseña</span><strong>{result.panel.password}</strong></div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          <a className="btn btn-primary btn-block" href={result.panel.url} target="_blank" rel="noreferrer">Ir al panel</a>
          <Link className="btn btn-outline btn-block" to="/">Volver al inicio</Link>
        </div>
        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 20 }}>
          {result.server.type === "Forge"
            ? "Forge puede tardar varios minutos (descarga muchas librerías). Podés cerrar esta página, va a seguir instalándose."
            : "La instalación puede tardar 1-2 minutos. Podés cerrar esta página, va a seguir instalándose."}
        </p>
      </div>
    </div>
  );
}

export default function Checkout() {
  const [params] = useSearchParams();
  const planName = params.get("plan") || "Blaze";
  const plan = ARCNODE_PLANS.find((p) => p.name === planName) || ARCNODE_PLANS.find((p) => p.name === "Blaze");
  const isFree = !!plan.free;
  // Forge doesn't boot reliably on the free plan's resources, so it's not offered there.
  const serverTypes = isFree ? SERVER_TYPES.filter((t) => t.value !== "forge") : SERVER_TYPES;
  const [cycle, setCycle] = useState("monthly");
  const [pay, setPay] = useState("card");
  const cycleMul = cycle === "monthly" ? 1 : cycle === "quarterly" ? 2.85 : 10.2;
  const cycleLabel = cycle === "monthly" ? "/ mes" : cycle === "quarterly" ? "/ trim" : "/ año";
  const fmt = (n) => "$" + Math.round(n).toLocaleString("es-AR");
  const baseARS = plan.priceARS || plan.price * 1500;
  const total = baseARS * cycleMul;

  const [form, setForm] = useState({
    serverName: "MiServerEpico",
    serverType: "paper",
    minecraftVersion: "latest",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setCardNumber = (e) => setForm((f) => ({ ...f, cardNumber: formatCardNumber(e.target.value) }));
  const setCardExpiry = (e) => setForm((f) => ({ ...f, cardExpiry: formatExpiry(e.target.value) }));
  const setCardCvc = (e) => setForm((f) => ({ ...f, cardCvc: e.target.value.replace(/\D/g, "").slice(0, 4) }));
  const cardBrand = detectCardBrand(form.cardNumber.replace(/\D/g, ""));

  const [step, setStep] = useState("form"); // form | processing | success | error
  const [processingLabel, setProcessingLabel] = useState("Validando método de pago…");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.email || form.password.length < 8) {
      setError("Completá nombre, email y una contraseña de al menos 8 caracteres.");
      setStep("error");
      return;
    }

    if (!isFree && pay === "card") {
      const digits = form.cardNumber.replace(/\D/g, "");
      if (!isValidLength(digits, cardBrand)) {
        setError("El número de tarjeta no tiene el largo correcto.");
        setStep("error");
        return;
      }
      if (!isExpiryValid(form.cardExpiry)) {
        setError("La fecha de vencimiento no es válida.");
        setStep("error");
        return;
      }
      const cvcLen = cardBrand?.id === "amex" ? 4 : 3;
      if (form.cardCvc.length !== cvcLen) {
        setError(`El CVC debe tener ${cvcLen} dígitos.`);
        setStep("error");
        return;
      }
    }

    setStep("processing");
    // The "payment" is fully simulated: whatever card data was entered is
    // accepted. We just walk through a believable sequence of steps while
    // the real provisioning call happens in the background.
    const typeLabel = SERVER_TYPES.find((t) => t.value === form.serverType)?.label || "servidor";
    const steps = isFree
      ? ["Creando tu cuenta…", `Creando tu servidor ${typeLabel}…`]
      : [
          "Validando método de pago…",
          "Procesando el pago…",
          "Pago aprobado. Creando tu cuenta…",
          `Creando tu servidor ${typeLabel}…`,
        ];
    let i = 0;
    setProcessingLabel(steps[0]);
    const stepTimer = setInterval(() => {
      i = Math.min(i + 1, steps.length - 1);
      setProcessingLabel(steps[i]);
    }, 700);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: plan.name,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          serverName: form.serverName,
          serverType: form.serverType,
          minecraftVersion: form.minecraftVersion,
        }),
      });
      const data = await res.json();
      clearInterval(stepTimer);
      if (!res.ok || !data.success) {
        setError(data.error || "No se pudo crear el servidor.");
        setStep("error");
        return;
      }
      setResult(data);
      setStep("success");
    } catch {
      clearInterval(stepTimer);
      setError("No se pudo conectar con el servidor de aprovisionamiento.");
      setStep("error");
    }
  };

  if (step === "success" && result) {
    return <SuccessScreen result={result} isFree={isFree} />;
  }

  if (step === "processing") {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "120px 40px", textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%", margin: "0 auto 28px",
          border: "3px solid var(--border)", borderTopColor: "var(--blue)",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
        <h2 style={{ fontSize: 20, margin: "0 0 10px" }}>{processingLabel}</h2>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>No cierres esta ventana.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px 0" }}>
        <div className="steps">
          <div className="step active"><span className="step-num">1</span> Plan</div>
          <div className="step active"><span className="step-num">2</span> Configurar</div>
          {!isFree && <div className="step active"><span className="step-num">3</span> Pago</div>}
        </div>
      </div>
      <form className="checkout-grid" onSubmit={handleSubmit}>
        <div>
          {step === "error" && (
            <div className="checkout-card" style={{ borderColor: "#ef4444", background: "rgba(239,68,68,0.07)" }}>
              <p style={{ margin: 0, color: "#ef4444", fontSize: 14 }}>{error}</p>
            </div>
          )}

          <div className="checkout-card">
            <h3>Datos del servidor</h3>
            <div className="input-row">
              <div className="input"><label>Nombre del servidor</label><input type="text" placeholder="MiServerEpico" value={form.serverName} onChange={set("serverName")} /></div>
              <div className="input"><label>Tipo de servidor</label>
                <select value={form.serverType} onChange={set("serverType")}>
                  {serverTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="input"><label>Versión de Minecraft</label>
                <select value={form.minecraftVersion} onChange={set("minecraftVersion")}>
                  {MC_VERSIONS.map((v) => <option key={v} value={v}>{v === "latest" ? "Última (recomendado)" : v}</option>)}
                </select>
              </div>
            </div>
            {form.serverType === "forge" && (
              <p style={{ fontSize: 12, color: "var(--amber)", margin: "10px 0 0" }}>
                Forge instala más lento que Paper (descarga muchas librerías) — puede tardar varios minutos.
              </p>
            )}
          </div>

          <div className="checkout-card">
            <h3>Creá tu cuenta ArcNode</h3>
            <div className="input-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="input"><label>Nombre</label><input type="text" required value={form.firstName} onChange={set("firstName")} /></div>
              <div className="input"><label>Apellido</label><input type="text" value={form.lastName} onChange={set("lastName")} /></div>
              <div className="input" style={{ gridColumn: "1 / -1" }}><label>Email</label><input type="email" required value={form.email} onChange={set("email")} /></div>
              <div className="input" style={{ gridColumn: "1 / -1" }}>
                <label>Contraseña del panel</label>
                <input type="password" required minLength={8} placeholder="Mínimo 8 caracteres" value={form.password} onChange={set("password")} />
                <span className="input-hint">La vas a usar para entrar al panel y administrar tu servidor.</span>
              </div>
            </div>
          </div>

          {!isFree && <div className="checkout-card">
            <h3>Método de pago</h3>
            <div className="pay-methods">
              <button type="button" className={"pay-method " + (pay === "card" ? "active" : "")} onClick={() => setPay("card")}>
                Tarjeta
              </button>
              <button type="button" className="pay-method" disabled>
                Mercado Pago
                <span className="pay-method-soon">Próximamente</span>
              </button>
            </div>
            {pay === "card" && (
              <div className="input-row">
                <div className="input">
                  <label>Número de tarjeta</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text" inputMode="numeric" placeholder="1234 5678 9012 3456"
                      value={form.cardNumber} onChange={setCardNumber}
                      style={{ paddingRight: cardBrand ? 70 : undefined }}
                    />
                    {cardBrand && (
                      <span style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        fontSize: 11, fontWeight: 700, color: "var(--blue)",
                        background: "rgba(55,138,221,0.1)", padding: "3px 8px", borderRadius: 6,
                      }}>{cardBrand.label}</span>
                    )}
                  </div>
                </div>
                <div className="input-row" style={{ gridTemplateColumns: "1fr 1fr 1fr", margin: 0 }}>
                  <div className="input"><label>Vencimiento</label><input type="text" inputMode="numeric" placeholder="MM/AA" value={form.cardExpiry} onChange={setCardExpiry} /></div>
                  <div className="input"><label>CVC</label><input type="text" inputMode="numeric" placeholder={cardBrand?.id === "amex" ? "1234" : "123"} value={form.cardCvc} onChange={setCardCvc} /></div>
                  <div className="input"><label>Cuotas</label><select><option>1 cuota</option><option>3 cuotas</option><option>6 cuotas</option><option>12 cuotas</option></select></div>
                </div>
              </div>
            )}
          </div>}
        </div>

        <aside>
          <div className="summary">
            <h3>Tu pedido</h3>
            {!isFree && (
              <div className="cycle-toggle">
                {[["monthly", "Mensual"], ["quarterly", "Trimestral"], ["yearly", "Anual"]].map(([k, l]) => (
                  <button key={k} type="button" className={cycle === k ? "active" : ""} onClick={() => setCycle(k)}>
                    {l}
                    {k === "quarterly" && <span className="cycle-save">-5%</span>}
                    {k === "yearly" && <span className="cycle-save">-15%</span>}
                  </button>
                ))}
              </div>
            )}
            <div className="summary-line"><span>Plan</span><strong>{isFree ? `${plan.name} (gratis)` : plan.name}</strong></div>
            {!isFree && <div className="summary-line"><span>RAM</span><strong>{plan.ram} GB</strong></div>}
            <div className="summary-line"><span>Almacenamiento</span><strong>{plan.ssd}</strong></div>
            <div className="summary-line"><span>Jugadores</span><strong>{isFree ? `hasta ${plan.players}` : "Sin límite"}</strong></div>
            <div className="summary-line"><span>Tipo</span><strong>{SERVER_TYPES.find((t) => t.value === form.serverType)?.label}</strong></div>
            <div className="summary-line"><span>Soporte</span><strong>{isFree ? "Básico" : "Por Discord"}</strong></div>
            {!isFree && cycle !== "monthly" && (
              <div className="summary-line"><span>Descuento</span><strong style={{ color: "var(--green)" }}>{cycle === "yearly" ? "-15%" : "-5%"}</strong></div>
            )}
            <div className="summary-total">
              <span>{isFree ? "Total" : `Total ${cycleLabel}`}</span>
              <strong>{isFree ? "Gratis" : fmt(total)}</strong>
            </div>
            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 16 }}>
              {isFree ? "Crear servidor gratis" : "Confirmar y pagar"}
            </button>
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 12, textAlign: "center" }}>
              {isFree ? "No necesitás tarjeta." : "Garantía de devolución de 14 días. Cancelás cuando quieras."}
            </p>
          </div>
        </aside>
      </form>
    </>
  );
}
