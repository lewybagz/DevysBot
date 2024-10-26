const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");
const { Translate } = require("../process_tools");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("back")
    .setDescription("Go back to the last song played"),

  async execute({ interaction }) {
    const queue = useQueue(interaction.guild);
    if (!queue?.isPlaying())
      return interaction.editReply({
        content: await Translate(
          `No music currently playing <${interaction.member}>... try again ? <❌>`
        ),
      });

    if (!queue.history.previousTrack)
      return interaction.editReply({
        content: await Translate(
          `There was no music played before <${interaction.member}>... try again ? <❌>`
        ),
      });

    await queue.history.back();

    const backEmbed = new EmbedBuilder()
      .setAuthor({ name: await Translate(`Playing the previous track <✅>`) })
      .setColor("#2f3136");

    interaction.editReply({ embeds: [backEmbed] });
  },
};
