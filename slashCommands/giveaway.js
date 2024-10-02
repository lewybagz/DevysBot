// slashCommands/giveaway.js
require("dotenv").config();
const config = require("../config.js"); // If using config.js
const cacheManager = require("../cacheManager.js");

async function handleGiveawayCommand(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    // Fetch configuration variables
    const numberOfWinners = interaction.options.getInteger("winners") || 1;
    const rolesInput = interaction.options.getString("roles");

    // Split roles if more than one was selected (comma-separated)
    const selectedRoleIds = rolesInput ? rolesInput.split(",") : [];

    const guild = interaction.guild;

    // Collect participants with at least one of the selected roles
    let participantIds = [];
    selectedRoleIds.forEach((roleId) => {
      participantIds = participantIds.concat(
        cacheManager.getUserIdsWithRole(roleId)
      );
    });

    // Remove duplicates
    participantIds = [...new Set(participantIds)];

    if (participantIds.length === 0) {
      await interaction.editReply(
        "No participants found with the specified role."
      );
      return;
    }

    if (numberOfWinners > participantIds.length) {
      await interaction.editReply(
        `Not enough participants to select ${numberOfWinners} winner(s).`
      );
      return;
    }

    // Randomly select winner(s)
    const winnerIds = shuffleArray(participantIds).slice(0, numberOfWinners);

    // Get winner usernames
    const winnerUsernames = winnerIds.map((userId) => {
      const username = cacheManager.getUsername(userId);
      return username ? `<@${userId}> (${username})` : `<@${userId}>`;
    });

    // Fetch the giveaway channel
    const giveawayChannel = guild.channels.cache.get(giveawayChannelId);
    if (!giveawayChannel) {
      await interaction.editReply("Giveaway channel not found.");
      return;
    }

    // Announce the winner(s)
    const announcement = `🎉 **Congratulations ${winnerUsernames.join(
      ", "
    )}! You have won the giveaway!** 🎉`;

    await giveawayChannel.send(announcement);

    // Confirm the giveaway to the command user
    await interaction.editReply("Giveaway completed and winner(s) announced!");
  } catch (error) {
    console.error("Error during giveaway:", error);
    await interaction.editReply(
      "An error occurred while running the giveaway."
    );
  }
}

// Utility function to shuffle an array
function shuffleArray(array) {
  const arr = array.slice(); // Copy array to avoid mutating original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

module.exports = { handleGiveawayCommand };
