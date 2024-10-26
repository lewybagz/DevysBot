const { QueryType, useMainPlayer } = require("discord-player");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Translate } = require("../process_tools");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song!")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("The song you want to play")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute({ interaction }) {
    try {
      if (!interaction.member.voice.channel) {
        return interaction.editReply({
          content: await Translate("You need to be in a voice channel! ❌"),
          ephemeral: true,
        });
      }

      const player = useMainPlayer();

      // Make sure player is properly initialized
      if (!player) {
        throw new Error("Player not initialized");
      }

      const song = interaction.options.getString("song");
      const res = await player.search(song, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });

      const defaultEmbed = new EmbedBuilder().setColor("#2f3136");

      if (!res || !res.tracks.length) {
        defaultEmbed.setDescription(
          await Translate("No results found... try again? ❌")
        );
        return interaction.editReply({ embeds: [defaultEmbed] });
      }

      try {
        await player.play(interaction.member.voice.channel, res.tracks[0], {
          nodeOptions: {
            metadata: interaction.channel,
            volume: config.opt?.volume || 100,
            leaveOnEmpty: config.opt?.leaveOnEmpty || true,
            leaveOnEmptyCooldown: config.opt?.leaveOnEmptyCooldown || 300000,
            leaveOnEnd: config.opt?.leaveOnEnd || true,
            leaveOnEndCooldown: config.opt?.leaveOnEndCooldown || 300000,
            // Add these options for better audio handling
            bufferingTimeout: 15000,
            skipOnNoStream: true,
            connectionTimeout: 30000,
          },
        });

        defaultEmbed
          .setDescription(
            await Translate(
              `Loading **${res.tracks[0].title}** to the queue... ✅`
            )
          )
          .setThumbnail(res.tracks[0].thumbnail);

        return interaction.editReply({ embeds: [defaultEmbed] });
      } catch (error) {
        console.error("Play error:", error);
        defaultEmbed.setDescription(
          await Translate(
            "Unable to join the voice channel or play the track. Please try again. ❌"
          )
        );
        return interaction.editReply({ embeds: [defaultEmbed] });
      }
    } catch (error) {
      console.error("Command error:", error);
      return interaction.editReply({
        content: await Translate(
          "An error occurred while processing your request. ❌"
        ),
        ephemeral: true,
      });
    }
  },
};
