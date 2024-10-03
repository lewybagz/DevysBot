const cacheManager = require("../utils/cacheManager.js");
const { updateChannelNames } = require("../utils/channelUpdater");

module.exports = async (client) => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Cache members for all guilds
  for (const [guild] of client.guilds.cache) {
    await cacheManager.cacheGuildMembers(guild);
  }

  // Update the channel names when bot is ready
  updateChannelNames(client);

  // Set an interval to update the channel names every minute
  setInterval(() => {
    updateChannelNames(client);
  }, 120000); // 1 minute interval

  // Set the bot's presence (activity and status)
  client.user.setPresence({
    activities: [
      {
        name: "Playing Operation LoveCraft: Fallen Doll(Ranked)", // The message shown (e.g., "Playing Music in the Lounge")
        type: "PLAYING", // The type of activity: 'PLAYING', 'LISTENING', 'WATCHING', etc.
      },
    ],
    status: "online", // Bot's status: 'online', 'idle', 'dnd', or 'invisible'
  });

  console.log("Bot presence set!");
};
