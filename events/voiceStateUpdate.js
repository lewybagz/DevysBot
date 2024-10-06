const { sendVoiceChannelEmbed } = require("../utils/sendEmbed"); // Import the embed function
const { getPlayer } = require("../slashCommands/play");

module.exports = (client) => {
  client.on("voiceStateUpdate", (oldState, newState) => {
    const player = getPlayer(); // Retrieve the player

    if (!player) return;

    const connection = newState.guild.voiceStates.cache.get(client.user.id); // Check if it's the bot

    if (!connection) return; // Ensure the bot is in the voice channel

    // Detect if the bot has been muted
    if (newState.mute && !oldState.mute) {
      sendVoiceChannelEmbed(
        newState,
        "I have been muted, I will pause the track until I have been unmuted!",
        "#FF0000",
        "🔴"
      );
      player.pause(); // Pause the player when muted
    }
    // Detect if the bot has been unmuted
    else if (!newState.mute && oldState.mute) {
      sendVoiceChannelEmbed(
        newState,
        "I have been unmuted, I will resume playing!",
        "#00FF00",
        "🟢"
      );
      player.unpause(); // Resume the player when unmuted
    }

    // Detect if the bot has been kicked from the voice channel
    if (newState.channelId === null && oldState.channelId !== null) {
      sendVoiceChannelEmbed(
        newState,
        "I have been kicked from the voice channel 😞",
        "#FF0000",
        "🔴"
      );
      connection.destroy(); // Destroy the connection if kicked
    }
  });
};
