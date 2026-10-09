// Background job for the free plan. The checkout backend runs on Vercel and
// can't keep timers, so the bot (which is always on, next to the panel) does
// it every minute:
// - gives customers access to newly installed free servers and ends RAM
//   boosts once their hour is up (server/freeplan.js),
// - stops free servers after 15 minutes without players and sends the
//   [Changuihost] chat messages (server/freeactivity.js).
import { isReverting, listAllServers, runFreePlanChecks } from "../server/freeplan.js";
import { runFreeActivityChecks } from "../server/freeactivity.js";

const EVERY_MS = 60 * 1000;
const log = (msg) => console.log(`[plan gratis] ${msg}`);

let running = false;

export function startFreePlanWorker() {
  const tick = async () => {
    // A tick can take longer than a minute (pings, a boost being reverted);
    // never run two at once.
    if (running) return;
    running = true;
    try {
      const servers = await listAllServers("allocations,variables");
      await runFreePlanChecks(log, servers);
      await runFreeActivityChecks(servers, { isBusy: isReverting, log });
    } catch (err) {
      console.error("[plan gratis] Error en la revisión:", err.message);
    } finally {
      running = false;
    }
  };
  tick();
  setInterval(tick, EVERY_MS);
}
