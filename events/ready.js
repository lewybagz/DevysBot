const cacheManager = require("../utils/cacheManager.js");
const { updateChannelNames } = require("../utils/channelUpdater");
const { registerCommands } = require("../utils/commandRegister");

module.exports = async (client) => {
  console.log(`Logged in as ${client.user.tag}!`);

  await client.guilds.fetch();

  let totalOnlineCount = 0;

  // Cache members for all guilds
  for (const [guildId] of client.guilds.cache) {
    try {
      const fetchedGuild = await client.guilds.fetch(guildId);
      if (fetchedGuild) {
        await cacheManager.cacheGuildMembers(fetchedGuild);

        // Count online members in this guild
        const onlineMembers = fetchedGuild.members.cache.filter(
          (member) =>
            member.presence?.status === "online" ||
            member.presence?.status === "idle" ||
            member.presence?.status === "dnd"
        ).size;

        totalOnlineCount += onlineMembers;
      } else {
        console.error(`Failed to fetch guild with ID ${guildId}`);
      }
    } catch (error) {
      console.error(`Error processing guild ${guildId}:`, error);
    }
  }

  cacheManager.setOnlineCount(totalOnlineCount);

  // Register commands after caching is complete
  console.log("Starting command registration...");
  await registerCommands(cacheManager);
  console.log("Command registration complete.");
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
