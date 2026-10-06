// Backend for the ArcNode.cc checkout simulation.
//
// The "payment" step is entirely fake (any card/data is accepted), but the
// server it provisions afterwards is real: it talks to the Pterodactyl
// Application API to create an actual user + Minecraft server on the demo
// panel. The API key never reaches the browser — only this process holds it.
//
// This module only builds the Express app (no listen()) so it can run both
// as a long-lived local process (server/index.js) and as a Vercel
// serverless function (api/[...all].js).

import express from "express";
import { ARCNODE_PLANS } from "../src/data/plans.js";

const {
  PTERODACTYL_URL,
  PTERODACTYL_API_KEY,
  PTERODACTYL_CLIENT_KEY,
  PTERODACTYL_NODE_ID = "1",
  PTERODACTYL_NEST_ID = "1",
  LAN_IP = "localhost",
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

async function pterodactyl(path, options = {}) {
  const res = await fetch(`${PTERODACTYL_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PTERODACTYL_API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = body?.errors?.[0]?.detail || res.statusText;
    const err = new Error(`Pterodactyl ${path} -> ${res.status}: ${detail}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

// The Client API acts on behalf of the server's owner, but an admin's
// client key is also accepted for any server on the panel — used here only
// for the live "is it running yet" status check.
async function pterodactylClient(path, options = {}) {
  const res = await fetch(`${PTERODACTYL_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PTERODACTYL_CLIENT_KEY}`,
      Accept: "application/json",
      ...options.headers,
    },
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Pterodactyl client ${path} -> ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

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

async function getEgg(eggId) {
  const res = await pterodactyl(`/api/application/nests/${NEST_ID}/eggs/${eggId}?include=variables`);
  return res.attributes;
}

const ssdToMb = (ssd) => {
  const n = parseInt(ssd, 10);
  return Number.isFinite(n) && n > 0 ? n * 1024 : 10 * 1024;
};

function randomSuffix() {
  return Math.random().toString(36).slice(2, 6);
}

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
      last_name: lastName || "ArcNode",
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
    body: JSON.stringify({ ip: "0.0.0.0", alias: LAN_IP, ports: [String(nextPort)] }),
  });
  const res2 = await pterodactyl(`/api/application/nodes/${NODE_ID}/allocations?per_page=200`);
  const created = res2.data.map((d) => d.attributes).find((a) => a.port === nextPort);
  if (!created) throw new Error("No se pudo crear una asignación de puerto nueva.");
  return created;
}

async function createServer({ user, plan, serverName, allocation, serverType, minecraftVersion }) {
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
      name: serverName || `${plan.name} — ${user.username}`,
      user: user.id,
      egg: type.eggId,
      nest: NEST_ID,
      docker_image: egg.docker_image,
      startup: EULA_PREFIX + egg.startup,
      environment,
      limits: { memory, swap: 0, disk, io: 500, cpu: 200 },
      feature_limits: { databases: 0, backups: plan.backups ? 1 : 0, allocations: 1 },
      allocation: { default: allocation.id },
      start_on_completion: true,
    }),
  });
  return { server: res.attributes, typeLabel: type.label };
}

export const app = express();
app.use(express.json());

app.post("/api/checkout", async (req, res) => {
  try {
    if (!PTERODACTYL_URL || !PTERODACTYL_API_KEY || !PTERODACTYL_CLIENT_KEY) {
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

    const plan = ARCNODE_PLANS.find((p) => p.name === planName) || ARCNODE_PLANS.find((p) => p.name === "Blaze");

    let user = await findUserByEmail(email);
    if (!user) {
      user = await createUser({ email, firstName, lastName, password });
    }

    const allocation = await findFreeAllocation();
    const { server, typeLabel } = await createServer({
      user, plan, serverName, allocation, serverType, minecraftVersion,
    });

    res.json({
      success: true,
      panel: {
        url: `http://${LAN_IP}:8080`,
        email: user.email,
        username: user.username,
        password,
      },
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
