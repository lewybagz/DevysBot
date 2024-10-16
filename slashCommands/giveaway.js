// slashCommands/giveaway.js
const config = require("../config.js"); // If using config.js
const {
  EmbedBuilder,
  ActivityType,
  SlashCommandBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Starts a giveaway among users with specific roles")
    .addIntegerOption((option) =>
      option
        .setName("winners")
        .setDescription("Number of winners")
        .setRequired(false)
    )
    .addRoleOption((option) =>
      option
        .setName("role1")
        .setDescription("First role to include in the giveaway")
        .setRequired(false)
    )
    .addRoleOption((option) =>
      option
        .setName("role2")
        .setDescription("Second role to include in the giveaway")
        .setRequired(false)
    ),
  execute: handleGiveawayCommand,
};

async function handleGiveawayCommand(interaction, client) {
  try {
    await interaction.deferReply({ ephemeral: true });

    // Fetch configuration variables
    const numberOfWinners = interaction.options.getInteger("winners") || 1;
    const role1 = interaction.options.getRole("role1");
    const role2 = interaction.options.getRole("role2");

    // Collect participants with at least one of the selected roles
    let participantIds = new Set();

    if (role1) {
      const role1Members = role1.members.map((member) => member.id);
      role1Members.forEach((id) => participantIds.add(id));
    }

    if (role2) {
      const role2Members = role2.members.map((member) => member.id);
      role2Members.forEach((id) => participantIds.add(id));
    }

    participantIds = Array.from(participantIds);

    if (participantIds.length === 0) {
      await interaction.editReply(
        "No participants found with the specified role(s)."
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
    const winnerDetails = await Promise.all(
      winnerIds.map(async (userId) => {
        const member = await interaction.guild.members.fetch(userId);
        return {
          name: `${member.user.username} 🏆`,
          inline: false,
        };
      })
    );

    const winnerUsernames = winnerDetails.map((detail) => detail.name);

    // Fetch the giveaway channel
    let giveawayChannel;
    try {
      giveawayChannel = await client.channels.fetch(config.giveawayChannelId);
      if (!giveawayChannel) {
        throw new Error("Giveaway channel not found");
      }
    } catch (channelError) {
      console.error("Error fetching giveaway channel:", channelError);
      await interaction.editReply(
        "Failed to fetch the giveaway channel. Please check the channel ID in the configuration."
      );
      return;
    }

    // Create a rich embed message
    const embed = new EmbedBuilder()
      .setTitle("🎉 Giveaway Winners! 🎉")
      .setColor("#00FF00") // Green for success
      .setDescription("Congratulations to the following winners:")
      .addFields(winnerDetails) // Add winners' details
      .setTimestamp();

    // Send the embed to the giveaway channel
    await giveawayChannel.send({ embeds: [embed] });

    try {
      await client.user.setPresence({
        activities: [
          {
            name: `🏆 Giving prizes to ${winnerUsernames.join(", ")}`,
            type: ActivityType.Custom,
          },
        ],
        status: "online",
      });
      console.log("Giveaway activity set successfully!");

      // Keep this activity for 1 hour
      setTimeout(async () => {
        try {
          // After 1 hour, reset the bot's activity to the default from ready.js
          await client.user.setPresence({
            activities: [
              {
                name: "Operation LoveCraft: Fallen Doll(Ranked)",
                type: ActivityType.Competing,
              },
            ],
            status: "online",
          });
          console.log("Bot activity reset to default after giveaway.");
        } catch (error) {
          console.error("Failed to reset bot activity after giveaway:", error);
        }
      }, 3600000); // 1 hour in milliseconds
    } catch (error) {
      console.error("Failed to set giveaway activity:", error);
    }

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
