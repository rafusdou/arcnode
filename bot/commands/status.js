import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { listServers, getServerResources } from "../pterodactyl.js";

export const data = new SlashCommandBuilder()
  .setName("status")
  .setDescription("Estado en vivo de los servidores en el panel de ArcNode");

const STATE_LABEL = {
  running: "🟢 Online",
  starting: "🟡 Iniciando",
  stopping: "🟡 Deteniendo",
  offline: "🔴 Offline",
};

export async function execute(interaction) {
  await interaction.deferReply();

  let servers;
  try {
    servers = await listServers();
  } catch (err) {
    await interaction.editReply(`No pude consultar el panel: ${err.message}`);
    return;
  }

  if (servers.length === 0) {
    await interaction.editReply("No hay servidores creados en el panel todavía.");
    return;
  }

  const rows = await Promise.all(
    servers.slice(0, 15).map(async (s) => {
      const res = await getServerResources(s.identifier);
      const state = res ? STATE_LABEL[res.current_state] || `⚪ ${res.current_state}` : "⚪ Desconocido";
      const mem = res ? `${(res.resources.memory_bytes / 1024 / 1024).toFixed(0)} MB` : "—";
      return `**${s.name}** — ${state}${res?.current_state === "running" ? ` · RAM: ${mem}` : ""}`;
    })
  );

  const embed = new EmbedBuilder()
    .setColor(0x378add)
    .setTitle("📡 Estado de servidores — ArcNode")
    .setDescription(rows.join("\n"))
    .setFooter({ text: servers.length > 15 ? `Mostrando 15 de ${servers.length} servidores` : `${servers.length} servidor(es)` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
