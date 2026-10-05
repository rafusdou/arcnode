import { createTicketChannel } from "../tickets.js";

// Discord interaction tokens die after ~3s if nothing's sent back. If a
// reply/editReply call itself fails (network hiccup, expired token) it
// throws — and an uncaught rejection from an event handler takes the whole
// bot process down. Every response attempt in this file goes through this
// so a single flaky API call can only ever fail loudly in the console,
// never crash the bot.
async function safeRespond(interaction, payload) {
  try {
    if (interaction.deferred || interaction.replied) await interaction.editReply(payload);
    else await interaction.reply(payload);
  } catch (err) {
    console.error("No se pudo responder la interacción (probablemente expiró):", err.message);
  }
}

export async function onInteractionCreate(interaction) {
  try {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`Error ejecutando /${interaction.commandName}:`, err);
        await safeRespond(interaction, { content: "Uh, algo se rompió ejecutando ese comando.", ephemeral: true });
      }
      return;
    }

    if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command?.autocomplete) return;
      try {
        await command.autocomplete(interaction);
      } catch (err) {
        console.error(`Error en autocomplete de /${interaction.commandName}:`, err);
      }
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId.startsWith("ticket_category_")) {
        const categoryId = interaction.customId.replace("ticket_category_", "");
        try {
          await createTicketChannel(interaction, categoryId);
        } catch (err) {
          console.error("Error creando ticket:", err);
          await safeRespond(interaction, { content: "No pude crear el ticket — avisale a un admin.", ephemeral: true });
        }
        return;
      }

      if (interaction.customId === "ticket_close") {
        await safeRespond(interaction, "Cerrando el ticket en 5 segundos…");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        return;
      }

      if (interaction.customId === "verify_me") {
        const roleId = process.env.DISCORD_VERIFIED_ROLE_ID;
        if (!roleId) {
          await safeRespond(interaction, { content: "La verificación no está configurada todavía.", ephemeral: true });
          return;
        }
        try {
          await interaction.member.roles.add(roleId);
          await safeRespond(interaction, { content: "¡Listo, ya estás verificado! 🎉", ephemeral: true });
        } catch {
          await safeRespond(interaction, { content: "No pude asignarte el rol — avisale a un admin.", ephemeral: true });
        }
      }
    }
  } catch (err) {
    // Last-resort net: whatever happened, it must never bubble up and kill
    // the process.
    console.error("Error inesperado manejando una interacción:", err);
  }
}
