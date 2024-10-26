const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { fetchPlayerRank } = require("../utils/rocketLeagueApi");
const { getRankEmblemUrl } = require("../utils/rankEmblems");

async function handleRankCommand(interactionaction) {
  await interactionaction.deferReply();

  const username = interactionaction.options.getString("username");

  try {
    const rankData = await fetchPlayerRank(username);

    if (!rankData.ranks || rankData.ranks.length === 0) {
      await interactionaction.editReply("No rank data found for this player.");
      return;
    }

    const highestRank = rankData.ranks.reduce((highest, current) =>
      current.mmr > highest.mmr ? current : highest
    );

    const totalGamesPlayed = rankData.ranks.reduce(
      (total, rank) => total + rank.played,
      0
    );

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`🚀 Rocket League Profile: ${username}`)
      .setDescription(
        `Highest Rank: **${highestRank.rank}** (${highestRank.playlist})
        Total Games Played: **${totalGamesPlayed}**
        Last Updated: **${new Date().toUTCString()}**`
      )
      .setTimestamp()
      .setFooter({
        text: "Rocket League Rank Tracker",
        iconURL: "https://ibb.co/3WWxX2w",
      })
      .setThumbnail(getRankEmblemUrl(highestRank.rank));

    // Add rank information for 1v1, 2v2, and 3v3
    if (rankData.ranks && rankData.ranks.length > 0) {
      const playlistNames = ["Duel", "Doubles", "Standard"];
      playlistNames.forEach((playlistName) => {
        const rank = rankData.ranks.find((r) => r.playlist === playlistName);
        if (rank) {
          embed.addFields({
            name: playlistName,
            value: `Rank: ${rank.rank}\nDivision: ${rank.division}\nMMR: ${rank.mmr}\nGames: ${rank.played}\nStreak: ${rank.streak}`,
            inline: true,
          });
        }
      });
    } else {
      embed.addFields({
        name: "Rank Data",
        value: "No rank data found for this player.",
        inline: false,
      });
    }

    // Add reward information
    if (rankData.reward) {
      embed.addFields({
        name: "Seasonal Rewards",
        value: `Level: ${rankData.reward.level}\nProgress: ${rankData.reward.progress}`,
        inline: false,
      });
    }

    await interactionaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Error in rank command:", error);
    if (error.message.includes("API request failed after multiple retries")) {
      await interactionaction.editReply(
        "The Rocket League API is currently experiencing issues. Please try again later."
      );
    } else if (error.message.includes("No player found")) {
      await interactionaction.editReply(
        `No player found with the username: ${username}. Please check the spelling and try again.`
      );
    } else {
      await interactionaction.editReply(
        "An error occurred while fetching the player rank. Please try again later."
      );
    }
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Get Rocket League player rank by Epic Games username")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("The Epic Games username")
        .setRequired(true)
    ),
  execute: handleRankCommand,
};
