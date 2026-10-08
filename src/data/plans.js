// ArcNode.cc — Minecraft hosting plans.
// Pricing rule per docs: flat $1.80 USD / GB RAM on every paid plan.
// Generated from the plan table so price, ARS conversion and tier
// thresholds live in one place instead of 25 hardcoded objects.

const USD_TO_ARS = 1500;
const PRICE_PER_GB = 1.8;

const PLAN_NAMES = [
  "Madera", "Piedra Arenisca", "Hierro", "Oro", "Diamante",
  "Esmeralda", "Lapislázuli", "Obsidiana", "Cuarzo", "Redstone", "Netherita", "Blaze",
  "Enderman", "Wither", "Ender Dragon", "Guardián", "Shulker", "Elder Guardian", "Pillager", "Ravager",
  "Phantom", "Vex", "Ghast", "Warden", "Herobrine",
];

// Jugadores simultáneos por GB de RAM (1..25). El SSD en GB coincide
// con este mismo número en toda la tabla de precios.
const PLAYERS = [
  5, 10, 15, 25, 35,
  50, 60, 75, 90, 100, 120, 150,
  175, 200, 225, 250, 275, 300, 325, 350,
  400, 425, 450, 500, 600,
];

const TIERS = [
  { name: "Básico", desc: "1 – 5 GB · amigos y comunidades chicas", from: 1, to: 5 },
  { name: "Intermedio", desc: "6 – 12 GB · comunidades activas con mods", from: 6, to: 12 },
  { name: "Avanzado", desc: "13 – 20 GB · servidores grandes y redes", from: 13, to: 20 },
  { name: "Elite", desc: "21 – 25 GB · redes BungeeCord profesionales", from: 21, to: 25 },
];
const tierFor = (ram) => TIERS.find((t) => ram >= t.from && ram <= t.to);

const backupsFor = (ram) => {
  if (ram <= 2) return false;
  if (ram <= 4) return "semanales";
  if (ram <= 8) return "diarios";
  if (ram <= 11) return "2x día";
  return "tiempo real";
};

const plans = [
  {
    tier: "Gratis", tierDesc: "Para probar el servicio",
    name: "Piedra", ram: 0, price: 0, priceARS: 0, pgb: null, pgbARS: null,
    free: true, players: 3, ssd: "2 GB", modpacks: false,
    backups: false, ip: false, ddos: false, support: false,
  },
];

PLAN_NAMES.forEach((name, i) => {
  const ram = i + 1;
  const players = PLAYERS[i];
  const tier = tierFor(ram);
  const isFirstOfTier = ram === tier.from;
  const price = ram * PRICE_PER_GB;

  plans.push({
    ...(isFirstOfTier ? { tier: tier.name, tierDesc: tier.desc } : {}),
    name, ram, price,
    priceARS: price * USD_TO_ARS,
    pgb: PRICE_PER_GB, pgbARS: PRICE_PER_GB * USD_TO_ARS,
    players,
    ssd: ram >= 8 ? `${players} GB NVMe` : `${players} GB`,
    modpacks: ram >= 6 ? "a pedido" : false,
    backups: backupsFor(ram),
    ip: ram >= 6,
    ddos: ram >= 8,
    support: "Discord",
    popular: ram === 12,
  });
});

export const ARCNODE_PLANS = plans;
