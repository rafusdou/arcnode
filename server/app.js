// Backend for the Changuihost checkout simulation.
//
// The "payment" step is entirely fake (any card/data is accepted), but the
// server it provisions afterwards is real: it talks to the Pterodactyl
// Application API to create an actual user + Minecraft server on the demo
// panel. The API key never reaches the browser — only this process holds it.
//
// This module only builds the Express app (no listen()) so it can run both
// as a long-lived local process (server/index.js) and as Vercel serverless
// functions (the files under api/).

import express from "express";
import { PLANS } from "../src/data/plans.js";
import { hasPanelConfig, pterodactyl, pterodactylClient } from "./ptero.js";
import {
  customerHasFreeServer, freeExternalId, getFreeOwner,
  getFreeServerView, startFreeServer, startToken, issueTicket, verifyStartToken,
} from "./freeplan.js";

const {
  PTERODACTYL_NODE_ID = "1",
  PTERODACTYL_NEST_ID = "1",
  LAN_IP = "localhost",
  PANEL_PUBLIC_URL = "https://panel.changuihost.com",
} = process.env;

const NODE_ID = Number(PTERODACTYL_NODE_ID);
const NEST_ID = Number(PTERODACTYL_NEST_ID);

// The three server types that actually exist as eggs on this panel (seeded
// by Pterodactyl out of the box). Each egg has its own env var for "which
// Minecraft version to install" — this is what the version dropdown maps to.
// Fabric/ATM10/FTB are NOT included here on purpose: there's no egg for
// them on this panel, and offering them in the UI without being able to
// deliver them would just be a broken promise.
const SERVER_TYPES = {
  paper: { eggId: 5, label: "Paper", versionVar: "MINECRAFT_VERSION" },
  vanilla: { eggId: 3, label: "Vanilla", versionVar: "VANILLA_VERSION" },
  forge: { eggId: 2, label: "Forge", versionVar: "MC_VERSION" },
};

// Wings runs the startup line through unquoted variable expansion (not a
// real shell invocation) — command substitutions $(...) still get evaluated
// as real shell syntax internally, but literal ; || > and quote characters
// typed directly into the line are NOT treated as operators, they just get
// word-split as plain text. So a wrapper like `bash -c "..."` breaks (the
// embedded quotes become inert literal characters once they're the result
// of expansion) — but a leading $(...) that writes eula.txt and produces
// no output works, because that's evaluated as a genuine subshell.
// This gets prepended to whatever startup line the egg itself ships with,
// so it works for Paper, Vanilla and Forge without touching their own
// (fairly different) startup logic.
const EULA_PREFIX = '$([ -f eula.txt ] || echo "eula=true" > eula.txt) ';

// Minecraft defaults to max-players=20. Plans with a cap (free and Basic) get
// it rewritten on every boot, so editing server.properties doesn't lift it.
// Uncapped plans get a high value on first boot only — when the key is
// missing — so an owner who wants a cap can still lower it.
const UNLIMITED_PLAYERS = 1000;
const playersPrefix = (plan) =>
  plan.maxPlayers
    ? `$(sed -i "/^max-players=/d" server.properties 2>/dev/null; echo "max-players=${plan.maxPlayers}" >> server.properties) `
    : `$(grep -q "^max-players=" server.properties 2>/dev/null || echo "max-players=${UNLIMITED_PLAYERS}" >> server.properties) `;

// Free servers only, rewritten on every boot so editing the files doesn't
// stick (the owner can't edit the startup line):
// - MOTD with the brand, as \u escapes: the startup line goes through
//   `eval echo`, so it has to stay plain ASCII, and Java reads \uXXXX in
//   server.properties as the real character (§ colors, á, ·).
// - player-idle-timeout kicks anyone idle for 10 minutes, so an AFK player
//   can't keep the server from shutting down when nobody's really playing
//   (the bot's worker stops it after 15 minutes empty).
// - The FREE icon, downloaded to a temp file first so a failed download
//   leaves the previous icon instead of an empty one.
const FREE_MOTD =
  "\\u00a76\\u00a7lChanguihost \\u00a7r\\u00a77\\u00b7 \\u00a7fServidor gratis\\n\\u00a77Cre\\u00e1 el tuyo en \\u00a76changuihost.com";
const FREE_IDLE_MINUTES = 10;
const FREE_ICON_URL = "https://changuihost.com/free-server-icon.png";
const FREE_PREFIX =
  `$(sed -i "/^motd=/d;/^player-idle-timeout=/d" server.properties 2>/dev/null; ` +
  `printf "%s\\n" "motd=${FREE_MOTD}" "player-idle-timeout=${FREE_IDLE_MINUTES}" >> server.properties) ` +
  `$(curl -fsSL -m 10 -o .server-icon.tmp ${FREE_ICON_URL} && mv .server-icon.tmp server-icon.png) `;

async function getEgg(eggId) {
  const res = await pterodactyl(`/api/application/nests/${NEST_ID}/eggs/${eggId}?include=variables`);
  return res.attributes;
}

const ssdToMb = (ssd) => {
  const n = parseInt(ssd, 10);
  return Number.isFinite(n) && n > 0 ? n * 1024 : 10 * 1024;
};

// Pterodactyl's "cpu" limit is a percentage of ONE core (100 = 1 core,
// 200 = 2 cores). A flat 200 for every plan meant any two servers together
// could already ask the host for more cores than a small box (a laptop, or
// the kind of cheap VPS this is meant to start on) actually has — so this
// scales with the plan instead: more RAM gets more CPU, but capped low
// enough that a handful of concurrent servers can't starve each other on a
// 2-4 core machine. Revisit the cap once there's a node with cores to spare.
const CPU_PER_GB = 50; // 0.5 core per GB of RAM
// A full core at least: with half a core, current Minecraft versions on an
// older CPU (the Mac's 2012 i7) can take over 60 s for a single tick and
// the server kills itself (Server Watchdog). It's a cap, not a reservation.
const CPU_MIN = 100;
const CPU_MAX = 200; // 2 cores, regardless of how big the plan is
const cpuLimitFor = (plan) => {
  const scaled = Math.max(plan.ram, 1) * CPU_PER_GB;
  return Math.min(Math.max(scaled, CPU_MIN), CPU_MAX);
};

function randomSuffix() {
  return Math.random().toString(36).slice(2, 6);
}

// Shown to the customer under the server name in their panel dashboard.
const planDescription = (plan) => (plan.free ? "Plan gratis de Changuihost" : `Plan ${plan.name} de Changuihost`);

async function findUserByEmail(email) {
  const res = await pterodactyl(`/api/application/users?filter[email]=${encodeURIComponent(email)}`);
  return res.data?.[0]?.attributes || null;
}

async function createUser({ email, firstName, lastName, password }) {
  const base = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "cliente";
  const username = `${base}_${randomSuffix()}`;
  const res = await pterodactyl("/api/application/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      username,
      first_name: firstName || "Cliente",
      last_name: lastName || "Changuihost",
      password,
    }),
  });
  return res.attributes;
}

async function findFreeAllocation() {
  const res = await pterodactyl(`/api/application/nodes/${NODE_ID}/allocations?per_page=200`);
  const allocations = res.data.map((d) => d.attributes);
  const free = allocations.find((a) => !a.assigned);
  if (free) return free;

  const maxPort = allocations.reduce((max, a) => Math.max(max, a.port), 25564);
  const nextPort = maxPort + 1;
  await pterodactyl(`/api/application/nodes/${NODE_ID}/allocations`, {
    method: "POST",
    // Same address players already use for this node (e.g. the Mac's
    // Tailscale IP); LAN_IP only for a node that has no ports yet.
    body: JSON.stringify({ ip: "0.0.0.0", alias: allocations[0]?.alias || LAN_IP, ports: [String(nextPort)] }),
  });
  const res2 = await pterodactyl(`/api/application/nodes/${NODE_ID}/allocations?per_page=200`);
  const created = res2.data.map((d) => d.attributes).find((a) => a.port === nextPort);
  if (!created) throw new Error("No se pudo crear una asignación de puerto nueva.");
  return created;
}

async function createServer({ owner, customer, plan, serverName, allocation, serverType, minecraftVersion }) {
  const type = SERVER_TYPES[serverType] || SERVER_TYPES.paper;
  const egg = await getEgg(type.eggId);

  // Start from every variable's own default (so eggs with extra required
  // fields like Forge's BUILD_TYPE still get a valid value), then apply the
  // version the customer picked.
  const environment = {};
  for (const v of egg.relationships.variables.data) {
    environment[v.attributes.env_variable] = v.attributes.default_value;
  }
  if (minecraftVersion && minecraftVersion !== "latest") {
    environment[type.versionVar] = minecraftVersion;
  }

  const memory = plan.ram > 0 ? plan.ram * 1024 : 1024;
  const disk = ssdToMb(plan.ssd);

  const res = await pterodactyl("/api/application/servers", {
    method: "POST",
    body: JSON.stringify({
      name: serverName || `${plan.name} — ${customer.username}`,
      description: planDescription(plan),
      external_id: plan.free ? freeExternalId(customer.id) : null,
      user: owner.id,
      egg: type.eggId,
      nest: NEST_ID,
      docker_image: egg.docker_image,
      startup: (plan.free ? FREE_PREFIX : "") + playersPrefix(plan) + EULA_PREFIX + egg.startup,
      environment,
      limits: { memory, swap: 0, disk, io: 500, cpu: cpuLimitFor(plan) },
      feature_limits: { databases: 0, backups: plan.backups ? 1 : 0, allocations: 1 },
      allocation: { default: allocation.id },
      // Free servers are turned on from the start page, never automatically.
      start_on_completion: !plan.free,
    }),
  });
  return { server: res.attributes, typeLabel: type.label };
}

export const app = express();
app.use(express.json());

app.post("/api/checkout", async (req, res) => {
  try {
    if (!hasPanelConfig()) {
      return res.status(500).json({ success: false, error: "El backend no tiene configuradas las credenciales de Pterodactyl." });
    }

    const {
      planName, email, password, firstName, lastName,
      serverName, serverType, minecraftVersion,
    } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Falta email o contraseña." });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: "La contraseña debe tener al menos 8 caracteres." });
    }
    if (serverType && !SERVER_TYPES[serverType]) {
      return res.status(400).json({ success: false, error: "Tipo de servidor inválido." });
    }

    const plan = PLANS.find((p) => p.name === planName) || PLANS.find((p) => p.name === "Blaze");

    if (plan.free && serverType === "forge") {
      return res.status(400).json({ success: false, error: "El plan gratis es solo para Paper o Vanilla." });
    }

    let user = await findUserByEmail(email);
    // An existing account keeps its own password: changing it here would let
    // anyone take over an account just by checking out with its email.
    const existingAccount = !!user;
    if (user && plan.free && (await customerHasFreeServer(user.id))) {
      return res.status(400).json({ success: false, error: "Ya tenés un servidor gratis con este email." });
    }
    if (!user) {
      user = await createUser({ email, firstName, lastName, password });
    }

    // Free servers belong to a service account; the customer gets access as a
    // subuser that can't start them, added once the install finishes (see
    // server/freeplan.js).
    const owner = plan.free ? await getFreeOwner() : user;
    const allocation = await findFreeAllocation();
    const { server, typeLabel } = await createServer({
      owner, customer: user, plan, serverName, allocation, serverType, minecraftVersion,
    });

    res.json({
      success: true,
      panel: {
        url: PANEL_PUBLIC_URL,
        email: user.email,
        username: user.username,
        password: existingAccount ? null : password,
        existingAccount,
      },
      start: plan.free ? { identifier: server.identifier, token: startToken(server.identifier) } : null,
      server: {
        id: server.id,
        identifier: server.identifier,
        name: server.name,
        plan: plan.name,
        type: typeLabel,
        version: minecraftVersion || "latest",
        ip: allocation.alias || allocation.ip,
        port: allocation.port,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "No se pudo aprovisionar el servidor. Intentá de nuevo en unos segundos." });
  }
});

app.get("/api/status", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const checkedAt = new Date().toISOString();
  if (!hasPanelConfig()) {
    return res.json({ panel: "down", checkedAt });
  }
  try {
    await pterodactyl("/api/application/nodes?per_page=1", { signal: AbortSignal.timeout(5000) });
    res.json({ panel: "up", checkedAt });
  } catch {
    res.json({ panel: "down", checkedAt });
  }
});

// Admin dashboard. Host numbers (CPU, RAM, disk) can only be read on the core
// machine itself, so they come from the metrics agent running there
// (agent/index.js). This just forwards the admin's password; the agent is
// the one that checks it.
app.get("/api/admin/metrics", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const { METRICS_URL = "http://localhost:4100" } = process.env;
  const range = ["1h", "24h", "7d"].includes(req.query.range) ? req.query.range : "24h";
  try {
    const upstream = await fetch(`${METRICS_URL}/metrics?range=${range}`, {
      headers: { Authorization: req.get("authorization") || "" },
      signal: AbortSignal.timeout(10 * 1000),
    });
    res.status(upstream.status).type("application/json").send(await upstream.text());
  } catch (err) {
    console.error("Agente de métricas:", err.message, err.cause?.code || err.cause?.message || "");
    res.status(502).json({ error: "agent_unreachable" });
  }
});

app.get("/api/checkout/status/:id", async (req, res) => {
  try {
    const data = await pterodactyl(`/api/application/servers/${req.params.id}`);
    const installed = !!data.attributes.container.installed;
    let running = false;
    if (installed) {
      try {
        const resources = await pterodactylClient(
          `/api/client/servers/${data.attributes.identifier}/resources`
        );
        running = resources?.attributes?.current_state === "running";
      } catch {
        /* wings may still be booting the container */
      }
    }
    res.json({ installed, running });
  } catch {
    res.status(404).json({ installed: false, running: false });
  }
});

// ---------- Free plan start page (/arrancar) ----------
// Every request carries the start link's token (?t=), signed per server.

function requireStartToken(req, res) {
  if (verifyStartToken(req.params.identifier, req.query.t)) return true;
  res.status(403).json({ error: "Este link de arranque no es válido." });
  return false;
}

function sendFreeError(res, err) {
  if (!err.publicMessage) console.error(err);
  const status = err.status && err.status < 500 ? err.status : 500;
  res.status(status).json({ error: err.publicMessage || "No se pudo completar. Probá de nuevo en unos segundos." });
}

app.get("/api/free/:identifier", async (req, res) => {
  res.set("Cache-Control", "no-store");
  if (!requireStartToken(req, res)) return;
  try {
    const view = await getFreeServerView(req.params.identifier);
    if (!view) return res.status(404).json({ error: "Este link no es de un servidor gratis." });
    res.json(view);
  } catch (err) {
    sendFreeError(res, err);
  }
});

app.post("/api/free/:identifier/:action", async (req, res) => {
  if (!requireStartToken(req, res)) return;
  const { identifier, action } = req.params;
  try {
    if (action === "queue") return res.json({ ticket: issueTicket(identifier, "queue") });
    if (action === "ad") return res.json({ ticket: issueTicket(identifier, "ad") });
    if (action === "start") return res.json(await startFreeServer(identifier, req.body || {}));
    res.status(404).json({ error: "Acción desconocida." });
  } catch (err) {
    sendFreeError(res, err);
  }
});
