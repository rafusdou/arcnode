import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { PLANS } from "../../src/data/plans.js";

export const data = new SlashCommandBuilder()
  .setName("planes")
  .setDescription("Muestra los planes de hosting de Changuihost y sus precios");

export async function execute(interaction) {
  const groups = new Map();
  for (const p of PLANS) {
    const tier = p.tier || [...groups.keys()].pop();
    if (!groups.has(tier)) groups.set(tier, []);
    groups.get(tier).push(p);
  }

  const embed = new EmbedBuilder()
    .setColor(0xf2b33d)
    .setTitle("Planes de Changuihost")
    .setDescription("$1,80 USD por GB de RAM en todos los planes, sin límite de jugadores en los pagos.\nEl detalle está en **changuihost.cc**.");

  for (const [tier, plans] of groups) {
    const lines = plans.map((p) => {
      const price = p.free ? "**Gratis**" : `**US$${p.price.toFixed(2)}**/mes`;
      return `\`${p.name}\` — ${p.free ? "hasta 3 jugadores" : `${p.ram} GB`} — ${price}`;
    });
    embed.addFields({ name: tier, value: lines.join("\n") });
  }

  await interaction.reply({ embeds: [embed] });
}
