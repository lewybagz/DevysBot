const { handleAntiSpam } = require("../modFeatures/antiSpam"); // Import the anti-spam logic

module.exports = (client) => {
  return async (message) => {
    console.log(
      `Message received from ${message.author.tag} in guild ${message.guild.name}`
    );

    // Call anti-spam handler for every new message
    await handleAntiSpam(message);

    if (message.author.bot) {
      console.log("Message author is a bot, ignoring for XP");
      return;
    }

    const xpSystem = client.xpSystem;
    if (!xpSystem) {
      console.error("XP System not initialized");
      return;
    }

    console.log(
      `Adding XP for user ${message.author.id} in guild ${message.guild.id}`
    );
    const leveledUp = await xpSystem.addXP(
      message.author.id,
      message.guild.id,
      xpSystem.messageXPAmount
    );

    if (leveledUp) {
      const userData = xpSystem.xpData[message.guild.id][message.author.id];
      console.log(`User ${message.author.tag} leveled up to ${userData.level}`);
      message.channel.send(
        `Congratulations ${message.author}! You've reached level ${userData.level}!`
      );
    }
  };
};
