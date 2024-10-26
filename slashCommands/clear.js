const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");
const { Translate } = require("../process_tools");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear all the music in the queue"),
  async execute({ interaction }) {
    const queue = useQueue(interaction.guild);
    if (!queue?.isPlaying())
      return interaction.editReply({
        content: await Translate(
          `No music currently playing <${interaction.member}>... try again ? <❌>`
        ),
      });

    if (!queue.tracks.toArray()[1])
      return interaction.editReply({
        content: await Translate(
          `No music in the queue after the current one <${interaction.member}>... try again ? <❌>`
        ),
      });

    queue.tracks.clear();

    const clearEmbed = new EmbedBuilder()
      .setAuthor({
        name: await Translate(`The queue has just been cleared <🗑️>`),
      })
      .setColor("#2f3136");

    interaction.editReply({ embeds: [clearEmbed] });
  },
};
