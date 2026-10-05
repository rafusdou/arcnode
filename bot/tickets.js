// Shared ticket logic: the category picker message and the channel creation
// that happens once someone picks a category from it.

import {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ChannelType, PermissionFlagsBits,
} from "discord.js";

export const TICKET_CATEGORIES = [
  { id: "soporte", label: "Soporte técnico", emoji: "🛠️", description: "Problemas con tu servidor, conexión, plugins, etc.", style: ButtonStyle.Primary },
  { id: "facturacion", label: "Facturación", emoji: "💳", description: "Pagos, planes, reembolsos.", style: ButtonStyle.Success },
  { id: "bug", label: "Reportar un bug", emoji: "🐛", description: "Algo roto en el sitio o el panel.", style: ButtonStyle.Danger },
  { id: "otro", label: "Otra consulta", emoji: "❓", description: "Cualquier otra cosa.", style: ButtonStyle.Secondary },
];

const PICKER_MARKER = "arcnode-ticket-picker";

export function buildPickerMessage() {
  const list = TICKET_CATEGORIES.map((c) => `${c.emoji} **${c.label}** — ${c.description}`).join("\n");

  const embed = new EmbedBuilder()
    .setColor(0x378add)
    .setTitle("🎫 Soporte ArcNode")
    .setDescription(`Elegí de qué se trata tu consulta y te abrimos un canal privado con el staff.\n\n${list}`)
    .setFooter({ text: PICKER_MARKER });

  const buttons = TICKET_CATEGORIES.map((c) =>
    new ButtonBuilder().setCustomId(`ticket_category_${c.id}`).setLabel(c.label).setEmoji(c.emoji).setStyle(c.style)
  );

  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(buttons)] };
}

// Posts the picker message once per channel — safe to call on every bot
// restart, it won't spam duplicates.
export async function ensurePickerMessage(client) {
  const channelId = process.env.DISCORD_TICKET_PICKER_CHANNEL_ID;
  if (!channelId) return;

  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel) {
    console.error(`No pude encontrar el canal ${channelId} para el picker de tickets.`);
    return;
  }

  const recent = await channel.messages.fetch({ limit: 20 }).catch(() => null);
  const alreadyPosted = recent?.some(
    (m) => m.author.id === client.user.id && m.embeds[0]?.footer?.text === PICKER_MARKER
  );
  if (alreadyPosted) return;

  await channel.send(buildPickerMessage());
  console.log(`  Mensaje de tickets publicado en #${channel.name}`);
}

async function getOrCreateTicketCategory(guild) {
  const configured = process.env.DISCORD_TICKET_CATEGORY_ID;
  if (configured) {
    const cat = await guild.channels.fetch(configured).catch(() => null);
    if (cat) return cat;
  }
  const existing = guild.channels.cache.find((c) => c.type === ChannelType.GuildCategory && c.name === "Tickets");
  if (existing) return existing;
  return guild.channels.create({ name: "Tickets", type: ChannelType.GuildCategory });
}

export async function createTicketChannel(interaction, categoryId) {
  const { guild, user } = interaction;
  const category = TICKET_CATEGORIES.find((c) => c.id === categoryId);
  const channelName = `ticket-${category.id}-${user.username}`.toLowerCase().slice(0, 90);

  const existing = guild.channels.cache.find((c) => c.name === channelName);
  if (existing) {
    await interaction.reply({ content: `Ya tenés un ticket abierto de esa categoría: ${existing}`, ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const ticketCategory = await getOrCreateTicketCategory(guild);
  const supportRoleId = process.env.DISCORD_SUPPORT_ROLE_ID;

  const overwrites = [
    { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
    { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
  ];
  if (supportRoleId) {
    overwrites.push({ id: supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
  }

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: ticketCategory.id,
    permissionOverwrites: overwrites,
  });

  const embed = new EmbedBuilder()
    .setColor(0x378add)
    .setTitle(`${category.emoji} ${category.label}`)
    .setDescription(`Hola ${user}, contanos qué necesitás y el staff te va a responder acá.${supportRoleId ? ` <@&${supportRoleId}>` : ""}`);

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_close").setLabel("Cerrar ticket").setStyle(ButtonStyle.Danger).setEmoji("🔒")
  );

  await channel.send({ embeds: [embed], components: [closeRow] });
  await interaction.editReply(`Listo, abrí tu ticket: ${channel}`);
}
