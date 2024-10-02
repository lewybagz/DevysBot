// events/ready.js
const cacheManager = require("../cacheManager.js");
const { updateChannelNames } = require("../utils/channelUpdater");

module.exports = async (client) => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Cache members for all guilds
  for (const [guildId, guild] of client.guilds.cache) {
    await cacheManager.cacheGuildMembers(guild);
  }

  // Update the channel names when bot is ready
  updateChannelNames(client);

  // Set an interval to update the channel names every minute
  setInterval(() => {
    updateChannelNames(client);
  }, 60000); // 1 minute interval
};
