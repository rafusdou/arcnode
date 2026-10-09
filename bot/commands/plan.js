import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { PLANS } from "../../src/data/plans.js";

export const data = new SlashCommandBuilder()
  .setName("plan")
  .setDescription("Detalle de un plan específico de Changuihost")
  .addStringOption((opt) =>
    opt.setName("nombre").setDescription("Nombre del plan").setRequired(true).setAutocomplete(true)
  );

export async function autocomplete(interaction) {
  const focused = interaction.options.getFocused().toLowerCase();
  const matches = PLANS
    .filter((p) => p.name.toLowerCase().includes(focused))
    .slice(0, 25)
    .map((p) => ({ name: `${p.name} (${p.free ? "Gratis" : p.ram + " GB"})`, value: p.name }));
  await interaction.respond(matches);
}

export async function execute(interaction) {
  const name = interaction.options.getString("nombre");
  const p = PLANS.find((x) => x.name.toLowerCase() === name.toLowerCase());

  if (!p) {
    await interaction.reply({ content: `No encontré un plan llamado "${name}". Probá \`/planes\` para ver la lista completa.`, ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(p.free ? 0x1d9e75 : 0xf2b33d)
    .setTitle(p.free ? `${p.name} (gratis)` : p.name)
    .addFields(
      { name: "RAM", value: p.free ? "—" : `${p.ram} GB`, inline: true },
      { name: "Jugadores", value: p.maxPlayers ? `hasta ${p.maxPlayers}` : "Sin límite", inline: true },
      { name: "Disco", value: `${parseInt(p.ssd, 10)} GB`, inline: true },
      { name: "Precio", value: p.free ? "Gratis" : `US$${p.price.toFixed(2)} / mes (≈ $${p.priceARS.toLocaleString("es-AR")} ARS)`, inline: false },
      { name: "Backups", value: p.backups ? "Desde el panel" : "No", inline: true },
      { name: "Soporte", value: p.free ? "Básico" : "Por Discord", inline: true },
    )
    .setFooter({ text: "Elegí este plan en changuihost.com" });

  await interaction.reply({ embeds: [embed] });
}
