const { handleAntiSpam } = require("../modFeatures/antiSpam"); // Import the anti-spam logic

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    // Call anti-spam handler for every new message
    await handleAntiSpam(message);
  });
};
