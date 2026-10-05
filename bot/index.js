import { Client, GatewayIntentBits, Collection } from "discord.js";
import { onReady } from "./events/ready.js";
import { onGuildMemberAdd } from "./events/guildMemberAdd.js";
import { onInteractionCreate } from "./events/interactionCreate.js";

import * as planes from "./commands/planes.js";
import * as plan from "./commands/plan.js";
import * as status from "./commands/status.js";

if (!process.env.DISCORD_TOKEN) {
  console.error("Falta DISCORD_TOKEN en .env");
  process.exit(1);
}

// A single failed Discord API call (expired interaction, network hiccup)
// must never take the whole bot down — log it and keep running instead.
process.on("unhandledRejection", (err) => console.error("Unhandled rejection:", err));
process.on("uncaughtException", (err) => console.error("Uncaught exception:", err));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // required for the welcome/verification flow
  ],
});

client.commands = new Collection();
for (const cmd of [planes, plan, status]) {
  client.commands.set(cmd.data.name, cmd);
}

client.on("error", (err) => console.error("Client error:", err));

client.once("clientReady", () => onReady(client));
client.on("guildMemberAdd", onGuildMemberAdd);
client.on("interactionCreate", onInteractionCreate);

client.login(process.env.DISCORD_TOKEN);
