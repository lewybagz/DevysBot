const { EmbedBuilder } = require("discord.js");

function sendVoiceChannelEmbed(interaction, message, color, icon) {
  const embed = new EmbedBuilder()
    .setColor(color) // Set color for embed (e.g., red for mute, green for unmute)
    .setDescription(`${icon} ${message}`) // Add the message with the appropriate icon
    .setTimestamp(); // Add a timestamp for the action

  interaction.channel.send({ embeds: [embed] });
}

module.exports = { sendVoiceChannelEmbed };
