import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ARCNODE_PLANS } from "../../src/data/plans.js";

export const data = new SlashCommandBuilder()
  .setName("planes")
  .setDescription("Muestra los planes de hosting de ArcNode.cc y sus precios");

export async function execute(interaction) {
  const groups = new Map();
  for (const p of ARCNODE_PLANS) {
    const tier = p.tier || [...groups.keys()].pop();
    if (!groups.has(tier)) groups.set(tier, []);
    groups.get(tier).push(p);
  }

  const embed = new EmbedBuilder()
    .setColor(0x378add)
    .setTitle("🧊 Planes ArcNode.cc")
    .setDescription("$2 USD por GB de RAM, siempre. Cambiás de plan cuando quieras, sin migraciones.\nMirá el detalle completo en **arcnode.cc/#planes**.");

  for (const [tier, plans] of groups) {
    const lines = plans.map((p) => {
      const price = p.free ? "**Gratis**" : `**$${p.price} USD**/mes`;
      const star = p.popular ? " ⭐" : "";
      return `\`${p.name}\`${star} — ${p.free ? "3 jugadores" : `${p.ram} GB · hasta ${p.players} jugadores`} — ${price}`;
    });
    embed.addFields({ name: tier, value: lines.join("\n") });
  }

  await interaction.reply({ embeds: [embed] });
}
