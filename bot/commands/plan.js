import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ARCNODE_PLANS } from "../../src/data/plans.js";

export const data = new SlashCommandBuilder()
  .setName("plan")
  .setDescription("Detalle de un plan específico de ArcNode.cc")
  .addStringOption((opt) =>
    opt.setName("nombre").setDescription("Nombre del plan").setRequired(true).setAutocomplete(true)
  );

export async function autocomplete(interaction) {
  const focused = interaction.options.getFocused().toLowerCase();
  const matches = ARCNODE_PLANS
    .filter((p) => p.name.toLowerCase().includes(focused))
    .slice(0, 25)
    .map((p) => ({ name: `${p.name} (${p.free ? "Gratis" : p.ram + " GB"})`, value: p.name }));
  await interaction.respond(matches);
}

export async function execute(interaction) {
  const name = interaction.options.getString("nombre");
  const p = ARCNODE_PLANS.find((x) => x.name.toLowerCase() === name.toLowerCase());

  if (!p) {
    await interaction.reply({ content: `No encontré un plan llamado "${name}". Probá \`/planes\` para ver la lista completa.`, ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(p.popular ? 0x378add : 0x1d9e75)
    .setTitle(`${p.name}${p.popular ? " ⭐ Más popular" : ""}`)
    .addFields(
      { name: "RAM", value: p.free ? "—" : `${p.ram} GB`, inline: true },
      { name: "Jugadores", value: `hasta ${p.players}`, inline: true },
      { name: "Almacenamiento", value: p.ssd, inline: true },
      { name: "Precio", value: p.free ? "Gratis para siempre" : `$${p.price} USD / mes (≈$${p.priceARS.toLocaleString("es-AR")} ARS)`, inline: false },
      { name: "Backups", value: p.backups ? `Sí (${p.backups})` : "No", inline: true },
      { name: "Anti-DDoS", value: p.ddos ? "Sí" : "No", inline: true },
      { name: "Modpacks a pedido", value: p.modpacks ? "Sí" : "No", inline: true },
    )
    .setFooter({ text: "Elegí este plan en arcnode.cc" });

  await interaction.reply({ embeds: [embed] });
}
