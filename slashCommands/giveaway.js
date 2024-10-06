// slashCommands/giveaway.js
require("dotenv").config();
const config = require("../config.js"); // If using config.js
const cacheManager = require("../utils/cacheManager.js");
const { EmbedBuilder } = require("discord.js");

async function handleGiveawayCommand(interaction, client) {
  try {
    await interaction.deferReply({ ephemeral: true });

    // Fetch configuration variables
    const numberOfWinners = interaction.options.getInteger("winners") || 1;
    const rolesInput = interaction.options.getString("roles");

    // Split roles if more than one was selected (comma-separated)
    const selectedRoleIds = rolesInput ? rolesInput.split(",") : [];

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
    const winnerDetails = winnerIds.map((userId) => {
      const userInfo = cacheManager.getUserInfo(userId);

      return {
        value: `${userInfo.profilePicture}`,
        name: `${userInfo.username}`,
        inline: false,
      };
    });

    const winnerUsernames = winnerIds.map((userId) => {
      const userInfo = cacheManager.getUserInfo(userId);
      return userInfo ? userInfo.username : "Unknown"; // Get username from cacheManager
    });

    const giveawayChannel = config.giveawayChannelId;

    // Create a rich embed message
    const embed = new EmbedBuilder()
      .setTitle("🎉 Giveaway Winners! 🎉")
      .setColor("#00FF00") // Green for success
      .setDescription("Congratulations to the following winners:")
      .addFields(winnerDetails) // Add winners' details
      .setTimestamp();

    // Send the embed to the giveaway channel
    await giveawayChannel.send({ embeds: [embed] });

    // Set the bot's activity to announce the winners
    client.user.setActivity(`Giving prizes to ${winnerUsernames.join(", ")}`, {
      type: "PLAYING",
    });

    // Keep this activity for 1 hour
    setTimeout(3600000).then(() => {
      // After 1 hour, reset the bot's activity to the default from ready.js
      client.user.setActivity(
        "Playing Operation LoveCraft: Fallen Doll(Ranked)",
        { type: "PLAYING" }
      ); // You can make this match what you have in ready.js
    });

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
