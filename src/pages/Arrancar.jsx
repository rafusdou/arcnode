import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { PLANS } from "../data/plans.js";
import { fmtPrice } from "../utils/currency.js";
import { LogoMark } from "../components/Logo.jsx";

async function freeApi(identifier, token, action = "", body) {
  const res = await fetch(`/api/free/${identifier}${action ? `/${action}` : ""}?t=${encodeURIComponent(token)}`, {
    method: action ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Algo salió mal. Probá de nuevo en unos segundos.");
  return data;
}

const clock = (ms) => new Date(ms).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function useSecondsLeft(endsAt) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [endsAt]);
  return endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : 0;
}

// For now the ad slot shows our own promo. When there are sponsors, this is
// where their creative goes.
function AdSlot({ secondsLeft, price }) {
  return (
    <div className="ad-slot">
      <div className="ad-label">Publicidad · {mmss(secondsLeft)}</div>
      <div className="ad-body">
        <LogoMark size={44} />
        <strong>Tu servidor, sin esperas.</strong>
        <p>Con un plan pago arranca al instante, queda prendido aunque no haya nadie y no tiene límite de jugadores.</p>
        <a href="/#planes" target="_blank" rel="noreferrer">Ver planes desde {price} por mes</a>
      </div>
    </div>
  );
}

export default function Arrancar() {
  const { identifier } = useParams();
  const [params] = useSearchParams();
  const token = params.get("t") || "";
  const { currency } = useApp();
  const cheapest = PLANS.find((p) => p.ram === 1);
  const price = fmtPrice(cheapest.price, currency, cheapest.priceARS);

  const [view, setView] = useState(null);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | waiting | starting
  const [queue, setQueue] = useState(null); // { ticket, endsAt }
  const [ad, setAd] = useState(null); // { ticket, endsAt }
  const starting = useRef(false);

  const load = useCallback(
    () => freeApi(identifier, token).then(setView).catch((e) => setError(e.message)),
    [identifier, token]
  );
  useEffect(() => { load(); }, [load]);

  // Keep the page in sync with the real server while something is changing.
  const busy = view && (!view.installed || view.state === "starting" || view.state === "stopping" || phase === "starting");
  useEffect(() => {
    if (!busy) return;
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [busy, load]);
  const startedAt = useRef(0);
  useEffect(() => {
    if (phase !== "starting") return;
    if (view?.state === "running") setPhase("idle");
    // Right after the start call the panel can still say "offline" for a few
    // seconds; if it still does after 45 s, the server didn't come up.
    else if (view?.state === "offline" && startedAt.current && Date.now() - startedAt.current > 45000) {
      setPhase("idle");
      setError("El servidor no arrancó. Fijate en la consola del panel qué pasó, o abrí un ticket en Discord.");
    }
  }, [phase, view]);

  const queueLeft = useSecondsLeft(queue?.endsAt);
  const adLeft = useSecondsLeft(ad?.endsAt);
  const adPlaying = !!ad && adLeft > 0;
  const adWatched = !!ad && adLeft === 0;

  const enterQueue = async () => {
    setError("");
    try {
      const { ticket } = await freeApi(identifier, token, "queue");
      setQueue({ ticket, endsAt: Date.now() + view.settings.queueSeconds * 1000 });
      setAd(null);
      setPhase("waiting");
    } catch (e) {
      setError(e.message);
    }
  };

  const watchAd = async () => {
    try {
      const { ticket } = await freeApi(identifier, token, "ad");
      setAd({ ticket, endsAt: Date.now() + view.settings.adSeconds * 1000 });
    } catch (e) {
      setError(e.message);
    }
  };

  // Start once the wait is over and, if an ad is playing, once it finishes.
  useEffect(() => {
    if (phase !== "waiting" || queueLeft > 0 || adPlaying || starting.current) return;
    starting.current = true;
    startedAt.current = Date.now();
    setPhase("starting");
    freeApi(identifier, token, "start", { queueTicket: queue.ticket, adTicket: adWatched ? ad.ticket : undefined })
      .then(load)
      .catch((e) => {
        setError(e.message);
        setPhase("idle");
      })
      .finally(() => { starting.current = false; });
  }, [phase, queueLeft, adPlaying, adWatched, ad, queue, identifier, token, load]);

  if (!view) {
    return (
      <div className="start-page">
        <div className="start-card">
          {error ? <><h1>No pudimos abrir tu servidor</h1><p className="start-sub">{error}</p></> : <p className="start-sub">Cargando…</p>}
        </div>
      </div>
    );
  }

  const { settings } = view;
  const address = view.ip && view.port ? `${view.ip}:${view.port}` : null;
  const boostLine = view.boostUntil && (
    <p className="start-boost">Doble de RAM ({settings.boostMemoryMb / 1024} GB) activo hasta las {clock(view.boostUntil)}.</p>
  );

  let content;
  if (!view.installed) {
    content = (
      <>
        <h1>Tu servidor se está instalando</h1>
        <p className="start-sub">Tarda uno o dos minutos. Esta página se actualiza sola.</p>
      </>
    );
  } else if (view.state === "running") {
    content = (
      <>
        <span className="start-state on">Prendido</span>
        <h1>{view.name} está andando</h1>
        {address && <p className="start-sub">Conectate desde Minecraft a <code>{address}</code></p>}
        {boostLine}
      </>
    );
  } else if (phase === "starting" || view.state === "starting") {
    content = (
      <>
        <span className="start-state">Prendiendo</span>
        <h1>Prendiendo {view.name}…</h1>
        <p className="start-sub">Suele tardar menos de un minuto. Esta página se actualiza sola.</p>
        {boostLine}
      </>
    );
  } else if (view.state === "stopping") {
    content = (
      <>
        <span className="start-state">Apagándose</span>
        <h1>{view.name} se está apagando</h1>
        <p className="start-sub">Cuando termine vas a poder prenderlo de nuevo.</p>
      </>
    );
  } else if (phase === "waiting") {
    const progress = 100 - (queueLeft / settings.queueSeconds) * 100;
    content = (
      <>
        <h1>{queueLeft > 0 ? `Tu servidor arranca en ${mmss(queueLeft)}` : "Terminando el anuncio…"}</h1>
        <div className="queue-bar"><div style={{ width: `${progress}%` }} /></div>
        <p className="start-sub">
          Los servidores gratis esperan un minuto antes de arrancar.{" "}
          <Link to="/#planes">Con un plan pago</Link> arrancan al instante.
        </p>

        {adPlaying && <AdSlot secondsLeft={adLeft} price={price} />}
        {adWatched && <p className="start-boost">Listo: tu servidor arranca con {settings.boostMemoryMb / 1024} GB de RAM durante {settings.boostMinutes} minutos.</p>}
        {!ad && !view.boostUntil && (
          <div className="boost-offer">
            <div>
              <strong>Duplicá la RAM gratis</strong>
              <p>Mirá un anuncio de {settings.adSeconds} segundos y tu servidor arranca con {settings.boostMemoryMb / 1024} GB durante {settings.boostMinutes} minutos.</p>
            </div>
            <button type="button" className="btn btn-primary" onClick={watchAd}>Mirar anuncio</button>
          </div>
        )}
        {boostLine}
      </>
    );
  } else {
    content = (
      <>
        <span className="start-state off">Apagado</span>
        <h1>{view.name}</h1>
        <p className="start-sub">
          Tu servidor está apagado. Al prenderlo vas a esperar un minuto, y mientras tanto podés mirar
          un anuncio para arrancar con el doble de RAM.
        </p>
        {boostLine}
        <button type="button" className="btn btn-primary btn-lg btn-block" onClick={enterQueue}>Prender servidor</button>
      </>
    );
  }

  return (
    <div className="start-page">
      <div className="start-card">
        {content}
        {error && <p className="start-error">{error}</p>}
      </div>
    </div>
  );
}
