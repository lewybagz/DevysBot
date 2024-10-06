// utils/channelUpdater.js
const config = require("../config");
const cacheManager = require("./cacheManager");

function calculateMemberGoal(totalMembers, currentGoal) {
  // Double the goal if total members meet or exceed the current goal
  if (totalMembers >= currentGoal) {
    return currentGoal * 2;
  }
  return currentGoal; // Otherwise, keep the current goal
}

// Function to update the channel names
async function updateChannelNames(client) {
  const guild = client.guilds.cache.get(config.guildId);

  if (!guild) return;

  // Get total members and online members
  const totalMembers = guild.memberCount;
  const onlineMembers = cacheManager.getOnlineMemberCount();

  // Update peak online
  const peakOnline = cacheManager.getPeakOnline();

  // Calculate dynamic member goal
  let currentGoal = config.initialMemberGoal; // Start with initial goal
  const memberGoal = calculateMemberGoal(totalMembers, currentGoal);

  // Fetch the channels
  const onlineMembersChannel = guild.channels.cache.get(
    config.channels.onlineMembers
  );
  const peakOnlineChannel = guild.channels.cache.get(
    config.channels.peakOnline
  );
  const totalMembersChannel = guild.channels.cache.get(
    config.channels.totalMembers
  );
  const memberGoalChannel = guild.channels.cache.get(
    config.channels.memberGoal
  );

  // Update the channel names
  if (onlineMembersChannel)
    await onlineMembersChannel.setName(`Current Online: ${onlineMembers}`);
  if (peakOnlineChannel)
    // TODO: set font
    await peakOnlineChannel.setName(`Peak Online: ${peakOnline}`);
  if (totalMembersChannel)
    await totalMembersChannel.setName(`Total Members: ${totalMembers}`);
  if (memberGoalChannel)
    await memberGoalChannel.setName(`Member Goal: ${memberGoal}`);
}

// Export the function so it can be used elsewhere
module.exports = { updateChannelNames };
