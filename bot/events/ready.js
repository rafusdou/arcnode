import { REST, Routes } from "discord.js";
import { ensurePickerMessage } from "../tickets.js";

// Registers all slash commands to every guild the bot is currently in.
// Guild-scoped registration is instant (global registration can take up to
// an hour to propagate), which matters a lot while iterating on the bot.
export async function onReady(client) {
  console.log(`ArcNode bot conectado como ${client.user.tag}`);

  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  const body = [...client.commands.values()].map((c) => c.data.toJSON());

  for (const [, guild] of client.guilds.cache) {
    try {
      await rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body });
      console.log(`  Comandos registrados en "${guild.name}"`);
    } catch (err) {
      console.error(`  No se pudieron registrar comandos en "${guild.name}":`, err.message);
    }
  }

  await ensurePickerMessage(client);

  client.user.setActivity("arcnode.cc · /planes");
}
