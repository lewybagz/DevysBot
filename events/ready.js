const cacheManager = require("../utils/cacheManager.js");
const { updateChannelNames } = require("../utils/channelUpdater");
const { ActivityType } = require("discord.js");
const XPSystem = require("../utils/xpSystem");

module.exports = async (client) => {
  console.log(`Logged in as ${client.user.tag}!`);
  const xpSystem = new XPSystem(client);
  await xpSystem.loadXPData();
  xpSystem.startVoiceXPTracker();

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

  updateChannelNames(client);

  // Set an interval to update the channel names every minute
  setInterval(() => {
    updateChannelNames(client);
  }, 120000);

  // Set the bot's presence (activity and status)
  try {
    await client.user.setPresence({
      activities: [
        {
          name: "Operation LoveCraft: Fallen Doll(Ranked)",
          type: ActivityType.Competing,
        },
      ],
      status: "online",
    });
  } catch (error) {
    console.error("Failed to set bot presence:", error);
  }
};
