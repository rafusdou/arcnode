// Thin wrapper around the Pterodactyl Application + Client APIs, shared by
// every bot command that needs live server data. Same panel the checkout
// backend (server/index.js) talks to.

const { PTERODACTYL_URL, PTERODACTYL_API_KEY, PTERODACTYL_CLIENT_KEY } = process.env;

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
    throw new Error(`Pterodactyl ${path} -> ${res.status}: ${detail}`);
  }
  return body;
}

async function pterodactylClient(path, options = {}) {
  const res = await fetch(`${PTERODACTYL_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PTERODACTYL_CLIENT_KEY}`,
      Accept: "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`Pterodactyl client ${path} -> ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function listServers() {
  const res = await pterodactyl("/api/application/servers?per_page=50");
  return res.data.map((d) => d.attributes);
}

export async function getServerResources(identifier) {
  try {
    const res = await pterodactylClient(`/api/client/servers/${identifier}/resources`);
    return res.attributes; // { current_state, resources: { memory_bytes, cpu_absolute, ... } }
  } catch {
    return null; // Wings offline / server never started — treat as unknown.
  }
}
