// Metrics agent for the core machine (today: WSL2 on Rafa's PC; later: the
// real server). It is the only piece that can see the host itself — CPU,
// RAM, disk, network — so it runs ON that machine, samples it every few
// seconds, asks the panel how each Minecraft server is doing, and keeps
// 7 days of per-minute history on disk.
//
// The admin dashboard (/admin on the site) never talks to it directly: the
// backend forwards the request (server/app.js → /api/admin/metrics), through
// the Cloudflare tunnel in production. Every request must carry
// METRICS_TOKEN, which doubles as the dashboard's password.
//
// Run: node --env-file=.env agent/index.js   (needs Node 18.15+ for statfs)

import http from "node:http";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";
import { hasPanelConfig, pterodactyl, pterodactylClient } from "../server/ptero.js";
import { pingPlayers } from "../server/mcping.js";

const {
  METRICS_TOKEN,
  METRICS_PORT = "4100",
  METRICS_HOST = "127.0.0.1",
  METRICS_DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "data"),
  PTERODACTYL_NODE_ID = "1",
  // The node this agent runs on: its servers are pinged on 127.0.0.1, the
  // rest (e.g. the Mac) on their allocation alias, over Tailscale.
  CORE_NODE_ID = "1",
} = process.env;

if (!METRICS_TOKEN || METRICS_TOKEN.length < 16) {
  console.error("Falta METRICS_TOKEN en .env (mínimo 16 caracteres).");
  process.exit(1);
}

const TICK_MS = 15 * 1000;
const HISTORY_STEP_MS = 60 * 1000;
const HISTORY_KEEP_MS = 7 * 24 * 60 * 60 * 1000;
const SAVE_EVERY_MS = 5 * 60 * 1000;
const SERVER_LIST_TTL_MS = 60 * 1000;
const HISTORY_FILE = path.join(METRICS_DATA_DIR, "history.json");

// Each range is drawn with a fixed number of buckets so the charts stay light
// no matter how much history exists.
const RANGES = {
  "1h": { span: 60 * 60 * 1000, step: 60 * 1000 },
  "24h": { span: 24 * 60 * 60 * 1000, step: 5 * 60 * 1000 },
  "7d": { span: 7 * 24 * 60 * 60 * 1000, step: 30 * 60 * 1000 },
};

// ---------- Host ----------

let prevCpu = null;
function cpuPercent() {
  const now = os.cpus().reduce(
    (acc, c) => {
      const t = c.times;
      acc.idle += t.idle;
      acc.total += t.user + t.nice + t.sys + t.idle + t.irq;
      return acc;
    },
    { idle: 0, total: 0 },
  );
  const prev = prevCpu;
  prevCpu = now;
  if (!prev || now.total === prev.total) return null;
  return Math.max(0, Math.min(100, 100 * (1 - (now.idle - prev.idle) / (now.total - prev.total))));
}

// os.freemem() on Linux is MemFree, which counts the page cache as "used"
// and makes a healthy box look full. MemAvailable is what's actually free.
async function memory() {
  const total = os.totalmem();
  try {
    const info = await fs.readFile("/proc/meminfo", "utf8");
    const kb = Number(info.match(/^MemAvailable:\s+(\d+)/m)?.[1]);
    if (kb) return { total, used: total - kb * 1024 };
  } catch {}
  return { total, used: total - os.freemem() };
}

async function disk() {
  try {
    const s = await fs.statfs("/");
    const total = s.blocks * s.bsize;
    return { total, used: total - s.bavail * s.bsize };
  } catch {
    return null;
  }
}

// Only the machine's real interfaces: Docker bridges and veth pairs carry the
// same Minecraft traffic a second time on its way to eth0.
const VIRTUAL_IFACE = /^(lo|docker|br-|veth|pterodactyl)/;
let prevNet = null;
async function network() {
  let rx = 0;
  let tx = 0;
  try {
    const dev = await fs.readFile("/proc/net/dev", "utf8");
    for (const line of dev.split("\n").slice(2)) {
      const [name, rest] = line.split(":");
      if (!rest || VIRTUAL_IFACE.test(name.trim())) continue;
      const f = rest.trim().split(/\s+/).map(Number);
      rx += f[0];
      tx += f[8];
    }
  } catch {
    return null;
  }
  const now = { rx, tx, at: Date.now() };
  const prev = prevNet;
  prevNet = now;
  if (!prev) return null;
  const secs = (now.at - prev.at) / 1000;
  // Counters reset when an interface comes back up; skip that sample.
  if (secs <= 0 || now.rx < prev.rx || now.tx < prev.tx) return null;
  return { rx: (now.rx - prev.rx) / secs, tx: (now.tx - prev.tx) / secs };
}

let osName = null;
async function hostInfo() {
  if (!osName) {
    try {
      const rel = await fs.readFile("/etc/os-release", "utf8");
      osName = rel.match(/^PRETTY_NAME="?([^"\n]+)"?/m)?.[1];
    } catch {}
    osName ||= `${os.type()} ${os.release()}`;
  }
  return {
    hostname: os.hostname(),
    os: osName,
    kernel: os.release(),
    cpuModel: os.cpus()[0]?.model?.trim() || null,
    cores: os.cpus().length,
    uptimeSec: Math.round(os.uptime()),
    load: os.loadavg().map((n) => Math.round(n * 100) / 100),
  };
}

// ---------- Panel ----------

let serverList = { at: 0, data: [] };
async function listServers() {
  if (Date.now() - serverList.at < SERVER_LIST_TTL_MS) return serverList.data;
  const res = await pterodactyl("/api/application/servers?per_page=100&include=allocations,user");
  const data = res.data.map(({ attributes: a }) => {
    const alloc = a.relationships.allocations.data.find((x) => x.attributes.id === a.allocation)?.attributes;
    return {
      id: a.id,
      identifier: a.identifier,
      name: a.name,
      plan: a.description?.match(/^Plan (.+) de Changuihost$/)?.[1] || null,
      free: (a.external_id || "").startsWith("free:"),
      owner: a.relationships.user?.attributes?.email || null,
      suspended: a.suspended || a.status === "suspended",
      installing: a.status === "installing" || a.status === "install_failed",
      limits: a.limits,
      port: alloc?.port || null,
      pingHost: String(a.node) === CORE_NODE_ID ? "127.0.0.1" : alloc?.alias || alloc?.ip,
    };
  });
  serverList = { at: Date.now(), data };
  return data;
}

async function serverStats(s) {
  const base = {
    id: s.id, identifier: s.identifier, name: s.name, plan: s.plan, free: s.free,
    owner: s.owner, port: s.port,
    cpuLimit: s.limits.cpu, memLimit: s.limits.memory * 1024 * 1024, diskLimit: s.limits.disk * 1024 * 1024,
  };
  if (s.suspended) return { ...base, state: "suspended" };
  if (s.installing) return { ...base, state: "installing" };
  try {
    const { attributes: r } = await pterodactylClient(`/api/client/servers/${s.identifier}/resources`);
    const running = r.current_state === "running";
    return {
      ...base,
      state: r.current_state,
      cpu: r.resources.cpu_absolute,
      mem: r.resources.memory_bytes,
      disk: r.resources.disk_bytes,
      uptimeMs: r.resources.uptime,
      players: running && s.port ? await pingPlayers(s.port, s.pingHost) : null,
    };
  } catch (err) {
    // 409 = the panel is still installing or transferring it.
    return { ...base, state: err.status === 409 ? "installing" : "unknown" };
  }
}

async function panelSnapshot() {
  if (!hasPanelConfig()) return { panel: "unconfigured", node: null, servers: [] };
  try {
    const [nodeRes, list] = await Promise.all([
      pterodactyl(`/api/application/nodes/${PTERODACTYL_NODE_ID}`),
      listServers(),
    ]);
    const n = nodeRes.attributes;
    const servers = await Promise.all(list.map(serverStats));
    return {
      panel: "up",
      node: {
        name: n.name,
        memory: { allocated: n.allocated_resources.memory * 1024 * 1024, total: n.memory * 1024 * 1024, overallocate: n.memory_overallocate },
        disk: { allocated: n.allocated_resources.disk * 1024 * 1024, total: n.disk * 1024 * 1024, overallocate: n.disk_overallocate },
      },
      servers,
    };
  } catch (err) {
    console.error("Panel:", err.message);
    return { panel: "down", node: latest?.node || null, servers: latest?.servers || [] };
  }
}

// ---------- Sampling & history ----------

let latest = null;
let history = [];
let pending = [];

async function tick() {
  const [cpu, mem, dsk, netRate, host, panel] = await Promise.all([
    cpuPercent(), memory(), disk(), network(), hostInfo(), panelSnapshot(),
  ]);
  const running = panel.servers.filter((s) => s.state === "running").length;
  const players = panel.servers.reduce((n, s) => n + (s.players?.online || 0), 0);
  latest = {
    at: Date.now(),
    host: { ...host, cpu, mem, disk: dsk, net: netRate },
    ...panel,
    totals: { servers: panel.servers.length, running, players },
  };
  pending.push({ cpu, mem: mem.used, disk: dsk?.used ?? null, rx: netRate?.rx ?? null, tx: netRate?.tx ?? null, running, players });
}

const avg = (xs) => {
  const v = xs.filter((x) => x != null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};
const max = (xs) => {
  const v = xs.filter((x) => x != null);
  return v.length ? Math.max(...v) : null;
};

function flushMinute() {
  if (!pending.length) return;
  const col = (k) => pending.map((p) => p[k]);
  history.push({
    t: Date.now(),
    cpu: avg(col("cpu")),
    mem: avg(col("mem")),
    disk: avg(col("disk")),
    rx: avg(col("rx")),
    tx: avg(col("tx")),
    running: max(col("running")),
    players: max(col("players")),
  });
  pending = [];
  const cutoff = Date.now() - HISTORY_KEEP_MS;
  while (history.length && history[0].t < cutoff) history.shift();
}

async function loadHistory() {
  try {
    const saved = JSON.parse(await fs.readFile(HISTORY_FILE, "utf8"));
    const cutoff = Date.now() - HISTORY_KEEP_MS;
    history = saved.filter((p) => p.t >= cutoff);
  } catch {}
}

async function saveHistory() {
  await fs.mkdir(METRICS_DATA_DIR, { recursive: true });
  const tmp = HISTORY_FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(history));
  await fs.rename(tmp, HISTORY_FILE);
}

// Buckets with no samples stay null, so a gap (agent or PC off) shows as a
// gap in the chart instead of a made-up line.
function rangeView(rangeKey) {
  const { span, step } = RANGES[rangeKey];
  const now = Date.now();
  const start = now - span;
  const inRange = history.filter((p) => p.t > start);
  const buckets = Array.from({ length: Math.ceil(span / step) }, () => []);
  for (const p of inRange) buckets[Math.min(buckets.length - 1, Math.floor((p.t - start) / step))].push(p);
  const points = buckets.map((b, i) => {
    const col = (k) => b.map((p) => p[k]);
    return {
      t: start + (i + 1) * step,
      cpu: avg(col("cpu")),
      mem: avg(col("mem")),
      rx: avg(col("rx")),
      tx: avg(col("tx")),
      running: max(col("running")),
      players: max(col("players")),
    };
  });
  const col = (k) => inRange.map((p) => p[k]);
  const sumBytes = (k) => inRange.reduce((n, p) => n + (p[k] || 0) * (HISTORY_STEP_MS / 1000), 0);
  return {
    range: rangeKey,
    stepSec: step / 1000,
    points,
    summary: {
      cpuAvg: avg(col("cpu")),
      cpuPeak: max(col("cpu")),
      memAvg: avg(col("mem")),
      memPeak: max(col("mem")),
      rxTotal: sumBytes("rx"),
      txTotal: sumBytes("tx"),
      playersPeak: max(col("players")),
      runningPeak: max(col("running")),
      // How much of the range actually has data (the agent may have been off).
      coverage: inRange.length / (span / HISTORY_STEP_MS),
      since: history[0]?.t || null,
    },
  };
}

// ---------- HTTP ----------

const digest = (s) => createHash("sha256").update(String(s)).digest();
const TOKEN_DIGEST = digest(METRICS_TOKEN);
const authorized = (req) => {
  const given = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  return given.length > 0 && timingSafeEqual(digest(given), TOKEN_DIGEST);
};

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://agent");
  if (req.method !== "GET" || url.pathname !== "/metrics") return send(res, 404, { error: "not_found" });
  if (!authorized(req)) return send(res, 401, { error: "unauthorized" });
  if (!latest) return send(res, 503, { error: "warming_up" });
  const rangeKey = RANGES[url.searchParams.get("range")] ? url.searchParams.get("range") : "24h";
  send(res, 200, {
    generatedAt: Date.now(),
    sampleEverySec: TICK_MS / 1000,
    ...latest,
    history: rangeView(rangeKey),
  });
});

await loadHistory();
cpuPercent();
await network();
await tick().catch((err) => console.error("Tick:", err));
setInterval(() => tick().catch((err) => console.error("Tick:", err)), TICK_MS);
setInterval(flushMinute, HISTORY_STEP_MS);
setInterval(() => saveHistory().catch((err) => console.error("Guardar historial:", err.message)), SAVE_EVERY_MS);

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    flushMinute();
    await saveHistory().catch(() => {});
    process.exit(0);
  });
}

server.listen(Number(METRICS_PORT), METRICS_HOST, () => {
  console.log(`Agente de métricas en http://${METRICS_HOST}:${METRICS_PORT}/metrics`);
});
