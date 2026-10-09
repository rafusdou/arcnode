// Pterodactyl API helpers shared by the checkout backend and the Discord bot.
// The Application API key (admin) manages users and servers; the admin's
// Client API key can also act on any server (power, console, subusers).

const { PTERODACTYL_URL, PTERODACTYL_API_KEY, PTERODACTYL_CLIENT_KEY } = process.env;

// No call may hang forever: the bot's worker waits on these, and on Vercel a
// hung call would just burn the function's time limit.
const TIMEOUT_MS = 20 * 1000;

export const hasPanelConfig = () => !!(PTERODACTYL_URL && PTERODACTYL_API_KEY && PTERODACTYL_CLIENT_KEY);

export async function pterodactyl(path, options = {}) {
  const res = await fetch(`${PTERODACTYL_URL}${path}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
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

export async function pterodactylClient(path, options = {}) {
  const res = await fetch(`${PTERODACTYL_URL}${path}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    ...options,
    headers: {
      Authorization: `Bearer ${PTERODACTYL_CLIENT_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = body?.errors?.[0]?.detail || res.statusText;
    const err = new Error(`Pterodactyl client ${path} -> ${res.status}: ${detail}`);
    err.status = res.status;
    throw err;
  }
  return body;
}
