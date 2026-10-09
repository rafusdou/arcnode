// Free plan internals:
// - Free servers are owned by a service account and the customer is added as
//   a subuser without start/restart permissions, so the only way to turn one
//   on is the start page (/arrancar), which makes them wait and offers the
//   ad-for-RAM boost.
// - The wait and the ad are enforced here, not in the browser: the page gets
//   signed tickets stamped with when it started waiting / watching, and
//   starting checks that enough time actually passed.
// - The boost doubles RAM for a while. Reverting it needs a restart (Java
//   sizes its heap at boot), which the Discord bot's worker does when it
//   expires — see runFreePlanChecks().

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { pterodactyl, pterodactylClient } from "./ptero.js";

const { PTERODACTYL_API_KEY = "" } = process.env;

export const FREE_SETTINGS = {
  queueSeconds: Number(process.env.FREE_QUEUE_SECONDS || 60),
  adSeconds: Number(process.env.FREE_AD_SECONDS || 30),
  boostMinutes: Number(process.env.FREE_BOOST_MINUTES || 60),
  baseMemoryMb: 1024,
  boostMemoryMb: 2048,
};

const TICKET_MAX_AGE_MS = 15 * 60 * 1000;
const FREE_OWNER_EMAIL = "gratis@changuihost.com";

// No control.start / control.restart, and no schedules (a schedule can run a
// power action), so the panel can't be used to skip the start page.
const SUBUSER_PERMISSIONS = [
  "websocket.connect", "control.console", "control.stop",
  "file.create", "file.read", "file.read-content", "file.update", "file.delete", "file.archive",
  "allocation.read", "startup.read", "settings.rename", "activity.read",
];

function httpError(status, publicMessage) {
  const err = new Error(publicMessage);
  err.status = status;
  err.publicMessage = publicMessage;
  return err;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Signing secret derived from the admin API key, so the start links need no
// extra configuration. Rotating that key invalidates every start link.
const SECRET = createHash("sha256").update(`changuihost-free:${PTERODACTYL_API_KEY}`).digest();
const sign = (data) => createHmac("sha256", SECRET).update(data).digest("base64url");
const safeEqual = (a, b) =>
  typeof a === "string" && typeof b === "string" && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export const startToken = (identifier) => sign(`start:${identifier}`);
export const verifyStartToken = (identifier, token) => safeEqual(token, startToken(identifier));

export function issueTicket(identifier, kind) {
  const payload = Buffer.from(JSON.stringify({ id: identifier, kind, at: Date.now() })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

// Age of a valid ticket in ms, or null if it's forged, for another server,
// of the wrong kind, or too old.
function ticketAge(ticket, identifier, kind) {
  if (typeof ticket !== "string") return null;
  const [payload, sig] = ticket.split(".");
  if (!payload || !safeEqual(sig, sign(payload))) return null;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString());
  if (data.id !== identifier || data.kind !== kind) return null;
  const age = Date.now() - data.at;
  return age >= 0 && age <= TICKET_MAX_AGE_MS ? age : null;
}

// Free-plan metadata lives in the server's external_id, which customers
// never see (the description shows up in their dashboard):
// "free:<customer user id>", plus ";boost=<epoch ms>" while boosted.
export const freeExternalId = (customerId, boostUntil = null) =>
  `free:${customerId}` + (boostUntil ? `;boost=${boostUntil}` : "");

export function parseFreeExternalId(externalId) {
  const m = /^free:(\d+)(?:;boost=(\d+))?$/.exec(externalId || "");
  return m ? { customerId: Number(m[1]), boostUntil: m[2] ? Number(m[2]) : null } : null;
}

export async function listAllServers(include = "") {
  const servers = [];
  for (let page = 1; ; page++) {
    const res = await pterodactyl(`/api/application/servers?per_page=100&page=${page}${include ? `&include=${include}` : ""}`);
    servers.push(...res.data.map((d) => d.attributes));
    if (page >= res.meta.pagination.total_pages) return servers;
  }
}

export async function customerHasFreeServer(customerId) {
  const servers = await listAllServers();
  return servers.some((s) => parseFreeExternalId(s.external_id)?.customerId === customerId);
}

export async function getFreeOwner() {
  const found = await pterodactyl(`/api/application/users?filter[email]=${encodeURIComponent(FREE_OWNER_EMAIL)}`);
  if (found.data?.[0]) return found.data[0].attributes;
  const res = await pterodactyl("/api/application/users", {
    method: "POST",
    body: JSON.stringify({
      email: FREE_OWNER_EMAIL,
      username: "changuihost-gratis",
      first_name: "Changuihost",
      last_name: "Gratis",
      password: randomBytes(24).toString("base64url"),
    }),
  });
  return res.attributes;
}

// The panel refuses subuser changes until a server finishes installing, so
// the customer is added afterwards: by the start page (which polls during the
// install) or by the bot's worker, whichever gets there first.
async function ensureSubuser(server, meta) {
  const users = await pterodactylClient(`/api/client/servers/${server.identifier}/users`);
  if (users.data.length) return;
  const customer = await pterodactyl(`/api/application/users/${meta.customerId}`);
  await pterodactylClient(`/api/client/servers/${server.identifier}/users`, {
    method: "POST",
    body: JSON.stringify({ email: customer.attributes.email, permissions: SUBUSER_PERMISSIONS }),
  });
}

const isInstalled = (server) => !!server.container.installed && server.status !== "installing";

async function getServerByIdentifier(identifier) {
  const client = await pterodactylClient(`/api/client/servers/${identifier}`);
  const res = await pterodactyl(`/api/application/servers/${client.attributes.internal_id}?include=allocations`);
  return res.attributes;
}

// null means "couldn't tell" (Wings can fail to answer mid-transition), which
// must never be read as offline: acting on a server that's still stopping is
// exactly what this is meant to avoid.
async function currentState(identifier) {
  try {
    const res = await pterodactylClient(`/api/client/servers/${identifier}/resources`);
    return res.attributes.current_state;
  } catch {
    return null;
  }
}

const power = (identifier, signal) =>
  pterodactylClient(`/api/client/servers/${identifier}/power`, { method: "POST", body: JSON.stringify({ signal }) });

const sendCommand = (identifier, command) =>
  pterodactylClient(`/api/client/servers/${identifier}/command`, { method: "POST", body: JSON.stringify({ command }) });

function setMemory(server, memoryMb) {
  const { limits, feature_limits } = server;
  return pterodactyl(`/api/application/servers/${server.id}/build`, {
    method: "PATCH",
    body: JSON.stringify({
      allocation: server.allocation,
      memory: memoryMb,
      swap: limits.swap,
      disk: limits.disk,
      io: limits.io,
      cpu: limits.cpu,
      threads: limits.threads,
      feature_limits,
    }),
  });
}

function setExternalId(server, externalId) {
  return pterodactyl(`/api/application/servers/${server.id}/details`, {
    method: "PATCH",
    body: JSON.stringify({ name: server.name, user: server.user, external_id: externalId, description: server.description }),
  });
}

const activeBoost = (meta) => (meta.boostUntil && meta.boostUntil > Date.now() ? meta.boostUntil : null);

export async function getFreeServerView(identifier) {
  const server = await getServerByIdentifier(identifier);
  const meta = parseFreeExternalId(server.external_id);
  if (!meta) return null;
  const alloc = server.relationships.allocations.data
    .map((a) => a.attributes)
    .find((a) => a.id === server.allocation);
  const installed = isInstalled(server);
  if (installed) await ensureSubuser(server, meta).catch((err) => console.error("ensureSubuser:", err.message));
  const view = {
    name: server.name,
    installed,
    state: await currentState(identifier),
    ip: alloc?.alias || alloc?.ip,
    port: alloc?.port,
    memoryMb: server.limits.memory,
    boostUntil: activeBoost(meta),
    settings: FREE_SETTINGS,
  };
  // An unknown state is shown as "stopping" so the page keeps polling instead
  // of offering a start that may not apply yet.
  if (!view.state) view.state = installed ? "stopping" : "offline";
  return view;
}

export async function startFreeServer(identifier, { queueTicket, adTicket }) {
  const server = await getServerByIdentifier(identifier);
  const meta = parseFreeExternalId(server.external_id);
  if (!meta) throw httpError(404, "Este link no es de un servidor gratis.");

  // One second of slack for clock skew between the timers and this check.
  const queueAge = ticketAge(queueTicket, identifier, "queue");
  if (queueAge === null || queueAge < FREE_SETTINGS.queueSeconds * 1000 - 1000) {
    throw httpError(400, "Todavía no terminó la espera.");
  }

  const state = await currentState(identifier);
  if (state === null) throw httpError(503, "No pudimos ver el estado del servidor. Probá de nuevo en unos segundos.");
  if (state !== "offline") return { started: false, state, boostUntil: activeBoost(meta) };

  let boostUntil = activeBoost(meta);
  if (adTicket) {
    const adAge = ticketAge(adTicket, identifier, "ad");
    if (adAge === null || adAge < FREE_SETTINGS.adSeconds * 1000 - 1000) {
      throw httpError(400, "El anuncio no se terminó de ver.");
    }
    if (!boostUntil) {
      boostUntil = Date.now() + FREE_SETTINGS.boostMinutes * 60 * 1000;
      await setExternalId(server, freeExternalId(meta.customerId, boostUntil));
      await setMemory(server, FREE_SETTINGS.boostMemoryMb);
    }
  }

  await power(identifier, "start");
  return { started: true, boostUntil };
}

async function waitForState(identifier, wanted, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await currentState(identifier)) === wanted) return true;
    await sleep(3000);
  }
  return false;
}

async function revertBoost(server, meta, log) {
  const state = await currentState(server.identifier);
  if (state === null || state === "stopping") {
    log(`${server.name}: no se pudo confirmar el estado, se reintenta en el próximo ciclo`);
    return;
  }
  const wasOn = state === "running" || state === "starting";
  if (state === "running") {
    await sendCommand(
      server.identifier,
      'tellraw @a {"text":"[Changuihost] Terminó el boost de RAM: el servidor se reinicia en 1 minuto con 1 GB.","color":"gold"}'
    ).catch(() => {});
    await sleep(60 * 1000);
  }
  const t0 = Date.now();
  if (wasOn) {
    await power(server.identifier, "stop");
    if (!(await waitForState(server.identifier, "offline", 120 * 1000))) {
      await power(server.identifier, "kill");
      if (!(await waitForState(server.identifier, "offline", 30 * 1000))) {
        log(`${server.name}: no terminó de apagarse, se reintenta en el próximo ciclo`);
        return;
      }
    }
  }
  const stoppedIn = Math.round((Date.now() - t0) / 1000);
  // Memory goes down only once the server is off: lowering the container's
  // limit under a running JVM sized for 2 GB could get it OOM-killed.
  await setMemory(server, FREE_SETTINGS.baseMemoryMb);
  await setExternalId(server, freeExternalId(meta.customerId, null));
  if (wasOn) await power(server.identifier, "start");
  const total = Math.round((Date.now() - t0) / 1000);
  log(
    `Boost terminado: ${server.name} vuelve a ${FREE_SETTINGS.baseMemoryMb} MB` +
      (wasOn ? ` (apagado en ${stoppedIn}s, reiniciado en ${total}s)` : "")
  );
}

const reverting = new Set();
export const isReverting = (serverId) => reverting.has(serverId);

// Called every minute by the bot: gives customers access to freshly installed
// free servers and ends expired boosts. Also catches a free server left with
// extra RAM but no boost marker (e.g. if writing the marker failed mid-boost).
export async function runFreePlanChecks(log = console.log, servers = null) {
  servers ||= await listAllServers();
  for (const server of servers) {
    const meta = parseFreeExternalId(server.external_id);
    if (!meta) continue;
    if (isInstalled(server)) {
      await ensureSubuser(server, meta).catch((err) => log(`No se pudo dar acceso a ${server.name}: ${err.message}`));
    }
    if (reverting.has(server.id)) continue;
    const expired = !activeBoost(meta);
    const hasExtraRam = server.limits.memory > FREE_SETTINGS.baseMemoryMb;
    if (!expired || (!hasExtraRam && !meta.boostUntil)) continue;
    reverting.add(server.id);
    revertBoost(server, meta, log)
      .catch((err) => log(`No se pudo terminar el boost de ${server.name}: ${err.message}`))
      .finally(() => reverting.delete(server.id));
  }
}
