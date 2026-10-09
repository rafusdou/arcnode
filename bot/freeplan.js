// Background job for the free plan. The checkout backend runs on Vercel and
// can't keep timers, so the bot (which is always on, next to the panel) gives
// customers access to newly installed free servers and ends RAM boosts once
// their hour is up. Logic lives in server/freeplan.js.
import { runFreePlanChecks } from "../server/freeplan.js";

const EVERY_MS = 60 * 1000;

export function startFreePlanWorker() {
  const tick = () =>
    runFreePlanChecks((msg) => console.log(`[plan gratis] ${msg}`)).catch((err) =>
      console.error("[plan gratis] Error revisando boosts:", err.message)
    );
  tick();
  setInterval(tick, EVERY_MS);
}
