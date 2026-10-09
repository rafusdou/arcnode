import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export async function onGuildMemberAdd(member) {
  const channelId = process.env.DISCORD_WELCOME_CHANNEL_ID;
  const channel = channelId
    ? await member.guild.channels.fetch(channelId).catch(() => null)
    : member.guild.systemChannel;
  if (!channel) return;

  const verifiedRoleId = process.env.DISCORD_VERIFIED_ROLE_ID;

  const embed = new EmbedBuilder()
    .setColor(0x1d9e75)
    .setTitle(`¡Bienvenido a Changuihost, ${member.user.username}!`)
    .setDescription(
      "Servidores de Minecraft a $1,80 USD por GB. Usá `/planes` para ver los precios y `/status` para el estado de los servidores. Si necesitás ayuda, abrí un ticket desde el canal de soporte." +
        (verifiedRoleId ? "\n\nApretá el botón para verificarte y desbloquear el resto del server." : "")
    )
    .setThumbnail(member.user.displayAvatarURL());

  const components = [];
  if (verifiedRoleId) {
    components.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("verify_me").setLabel("Verificarme").setStyle(ButtonStyle.Success).setEmoji("✅")
      )
    );
  }

  await channel.send({ content: `${member}`, embeds: [embed], components });
}
