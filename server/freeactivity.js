// Free plan, part two (run every minute by the bot's worker, next to
// runFreePlanChecks): shuts free servers down after 15 minutes with nobody
// on, and sends the [Changuihost] chat messages described in
// docs/PLAN-GRATIS.md section 4.
//
// Rules the messages follow (see the doc):
// - Only true things: "full" only when it's full, "memory" only when it is.
// - At most one message every 15 minutes and 3 per hour, and only with
//   players connected; the first one 10 minutes after the server started.
// - Contextual messages beat brand ones; each contextual one at most once an
//   hour per server. Sponsors at most once every 45 minutes.
//
// State lives in memory: if the bot restarts, the worst case is a message
// a few minutes early or late, or the idle countdown starting over.

import { readFile } from "node:fs/promises";
import { pterodactylClient } from "./ptero.js";
import { pingPlayers } from "./mcping.js";
import { PLANS, PRICE_PER_GB } from "../src/data/plans.js";

// The bot runs on the core machine (node CORE_NODE_ID), so that node's
// servers are pinged on 127.0.0.1; servers on other nodes (the Mac) on their
// allocation's alias, which is reachable over Tailscale.
const { CORE_NODE_ID = "1" } = process.env;

const MIN = 60 * 1000;
const IDLE_STOP_MS = Number(process.env.FREE_IDLE_STOP_MINUTES || 15) * MIN;
const FIRST_MESSAGE_AFTER_MS = 10 * MIN;
const MESSAGE_GAP_MS = 15 * MIN;
const MESSAGES_PER_HOUR = 3;
const CONTEXTUAL_EVERY_MS = 60 * MIN;
const SPONSOR_EVERY_MS = 45 * MIN;
const MEMORY_HIGH = 0.85;
const MEMORY_HIGH_FOR_MS = 2 * MIN;
const AFTER_IDLE_RESTART_MS = 2 * MIN;
const SPONSORS_FILE = new URL("../bot/sponsors.json", import.meta.url);

// ---------- Message texts (numbers come from the plan table) ----------

const freePlan = PLANS.find((p) => p.free);
const paidByRam = (ram) => PLANS.find((p) => !p.free && p.ram === ram);
const usd = (n) => `US$${n.toFixed(2).replace(".", ",")}`;
const utm = (id) => `https://changuihost.com/?utm_source=free_server&utm_medium=chat&utm_campaign=${id}`;

// A message is a list of parts: plain strings, { b: "bold" }, or
// { link: "text", id } for the clickable changuihost.com link.
const MESSAGES = {
  "marca-1": () => ["Este servidor está alojado gratis en ", { b: "Changuihost" }, ". ¿Querés uno propio? ", { link: "changuihost.com" }],
  "marca-2": () => ["¿Te gusta este server? El dueño puede pasarlo a un plan pago desde ", { b: `${usd(PRICE_PER_GB)}/mes` }, " y sacar estos mensajes."],
  "marca-3": () => ["Los planes pagos no se apagan cuando no hay nadie conectado. Planes en ", { link: "changuihost.com" }],
  "marca-4": () => {
    const p = paidByRam(2);
    return [`Con `, { b: "2 GB" }, ` entran hasta ${p.maxPlayers ?? p.players} jugadores. Planes en `, { link: "changuihost.com" }];
  },
  lleno: () => {
    const [a, b] = [paidByRam(1), paidByRam(2)];
    return [`El servidor está lleno (${freePlan.maxPlayers}/${freePlan.maxPlayers}). Con el plan `, { b: a.name }, ` entran ${a.maxPlayers} y con `, { b: b.name }, `, ${b.maxPlayers}. `, { link: "changuihost.com" }];
  },
  memoria: () => ["El servidor está usando casi toda su memoria y puede andar más lento. Con ", { b: "2 GB" }, " tendría el doble. ", { link: "changuihost.com" }],
  apagado: () => ["Este servidor se apaga solo cuando no hay nadie. Los planes pagos quedan prendidos aunque no haya jugadores. ", { link: "changuihost.com" }],
};
const BRAND_ORDER = ["marca-1", "marca-2", "marca-3", "marca-4"];

// Minecraft 1.21.5 renamed the click field of chat components; older
// versions only understand the old one. "latest" means the new format.
function usesNewClickFormat(version) {
  if (!version || version === "latest") return true;
  const [maj, min = 0, patch = 0] = version.split(".").map((n) => parseInt(n, 10) || 0);
  return maj > 1 || min > 21 || (min === 21 && patch >= 5);
}

function tellraw(parts, id, version, prefix = "[Changuihost] ") {
  const newFormat = usesNewClickFormat(version);
  const components = [{ text: prefix, color: "gold", bold: true }];
  for (const part of parts) {
    if (typeof part === "string") components.push({ text: part, color: "gray", bold: false });
    else if (part.b) components.push({ text: part.b, color: "white", bold: true });
    else if (part.link) {
      const url = part.url || utm(id);
      components.push({
        text: part.link, color: "gold", bold: false, underlined: true,
        ...(newFormat ? { click_event: { action: "open_url", url } } : { clickEvent: { action: "open_url", value: url } }),
      });
    }
  }
  return `tellraw @a ${JSON.stringify(["", ...components])}`;
}

// Sponsors are loaded from bot/sponsors.json on every check, so adding or
// ending a campaign needs no restart. Format in docs/PLAN-GRATIS.md 4.4.
async function activeSponsor(lastSponsorId) {
  let list = [];
  try {
    list = JSON.parse(await readFile(SPONSORS_FILE, "utf8"));
  } catch {
    return null;
  }
  const today = new Date().toISOString().slice(0, 10);
  const live = list.filter((s) => s.desde <= today && today <= s.hasta && s.marca && s.texto && s.url);
  if (!live.length) return null;
  // Rotate so the same sponsor doesn't repeat back to back.
  const next = live.findIndex((s) => s.id === lastSponsorId) + 1;
  return live[next % live.length];
}

// ---------- Per-server state ----------

const state = new Map();
const stateFor = (id) => {
  if (!state.has(id)) {
    state.set(id, { emptySince: null, memHighSince: null, sentAt: [], lastById: {}, brandIndex: 0, idleStopped: false, lastSponsorId: null });
  }
  return state.get(id);
};

function versionOf(server) {
  const vars = server.relationships?.variables?.data || [];
  const v = vars.map((x) => x.attributes).find((x) => /^(MINECRAFT_VERSION|VANILLA_VERSION)$/.test(x.env_variable));
  return v ? v.server_value || v.default_value : "latest";
}

function pingTarget(server) {
  const allocs = server.relationships?.allocations?.data || [];
  const alloc = allocs.map((a) => a.attributes).find((a) => a.id === server.allocation);
  if (!alloc) return null;
  const host = String(server.node) === CORE_NODE_ID ? "127.0.0.1" : alloc.alias || alloc.ip;
  return { host, port: alloc.port };
}

const send = (identifier, command) =>
  pterodactylClient(`/api/client/servers/${identifier}/command`, { method: "POST", body: JSON.stringify({ command }) });

const stop = (identifier) =>
  pterodactylClient(`/api/client/servers/${identifier}/power`, { method: "POST", body: JSON.stringify({ signal: "stop" }) });

// Picks the message to send now, or null. Order: the after-idle-restart
// notice, contextual ones (full, memory), a sponsor, then the brand rotation.
async function pickMessage(st, { now, uptimeMs, online, max, memHigh }) {
  const recent = st.sentAt.filter((t) => now - t < 60 * MIN);
  st.sentAt = recent;
  if (recent.length >= MESSAGES_PER_HOUR) return null;
  if (recent.length && now - recent[recent.length - 1] < MESSAGE_GAP_MS) return null;

  const canRepeat = (id, every = CONTEXTUAL_EVERY_MS) => !st.lastById[id] || now - st.lastById[id] >= every;

  if (st.idleStopped && uptimeMs >= AFTER_IDLE_RESTART_MS) return { id: "apagado" };
  if (uptimeMs < FIRST_MESSAGE_AFTER_MS) return null;
  if (max && online >= max && canRepeat("lleno")) return { id: "lleno" };
  if (memHigh && canRepeat("memoria")) return { id: "memoria" };
  if (canRepeat("sponsor", SPONSOR_EVERY_MS)) {
    const sponsor = await activeSponsor(st.lastSponsorId);
    if (sponsor) return { id: "sponsor", sponsor };
  }
  const id = BRAND_ORDER[st.brandIndex % BRAND_ORDER.length];
  return { id, brand: true };
}

async function checkServer(server, log) {
  const st = stateFor(server.id);
  const now = Date.now();
  let res;
  try {
    res = (await pterodactylClient(`/api/client/servers/${server.identifier}/resources`)).attributes;
  } catch {
    return; // Unknown state: do nothing this round.
  }

  if (res.current_state !== "running") {
    st.emptySince = null;
    st.memHighSince = null;
    return;
  }

  const target = pingTarget(server);
  const ping = target ? await pingPlayers(target.port, target.host) : null;
  // Still booting (not answering pings yet): don't count it as empty.
  if (!ping) return;

  const uptimeMs = res.resources.uptime;
  const memRatio = res.resources.memory_bytes / (server.limits.memory * 1024 * 1024);
  st.memHighSince = memRatio >= MEMORY_HIGH ? st.memHighSince || now : null;
  const memHigh = st.memHighSince && now - st.memHighSince >= MEMORY_HIGH_FOR_MS;

  if (ping.online === 0) {
    st.emptySince = st.emptySince || now;
    if (now - st.emptySince >= IDLE_STOP_MS) {
      await stop(server.identifier);
      st.emptySince = null;
      st.idleStopped = true;
      log(`${server.name}: apagado por inactividad (${IDLE_STOP_MS / MIN} min sin jugadores)`);
    }
    return;
  }
  st.emptySince = null;

  const pick = await pickMessage(st, { now, uptimeMs, online: ping.online, max: ping.max, memHigh });
  if (!pick) return;

  const version = versionOf(server);
  const command = pick.sponsor
    ? tellraw([`${pick.sponsor.marca}: ${pick.sponsor.texto}. `, { link: "Ver más", url: pick.sponsor.url }], pick.id, version, "[Sponsor] ")
    : tellraw(MESSAGES[pick.id](), pick.id, version);

  await send(server.identifier, command);
  st.sentAt.push(now);
  st.lastById[pick.id] = now;
  if (pick.brand) st.brandIndex++;
  if (pick.sponsor) st.lastSponsorId = pick.sponsor.id;
  if (pick.id === "apagado") st.idleStopped = false;
  log(`${server.name}: mensaje ${pick.sponsor ? `sponsor ${pick.sponsor.id}` : pick.id} (${ping.online} conectados)`);
}

// `servers` must come with ?include=allocations,variables. Servers being
// reverted from a boost are skipped: that flow stops and restarts them.
export async function runFreeActivityChecks(servers, { isBusy = () => false, log = console.log } = {}) {
  const free = servers.filter((s) => (s.external_id || "").startsWith("free:"));
  for (const id of state.keys()) if (!free.some((s) => s.id === id)) state.delete(id);
  for (const server of free) {
    if (isBusy(server.id)) continue;
    await checkServer(server, log).catch((err) => log(`${server.name}: ${err.message}`));
  }
}
