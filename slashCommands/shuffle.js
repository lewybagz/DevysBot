const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");
const { Translate } = require("../process_tools");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffle the queue"),

  async execute({ interaction }) {
    const queue = useQueue(interaction.guild);
    if (!queue?.isPlaying())
      return interaction.editReply({
        content: await Translate(
          `No music currently playing <${interaction.member}>... try again ? <❌>`
        ),
      });

    if (!queue.tracks.toArray()[0])
      return interaction.editReply({
        content: await Translate(
          `No music in the queue after the current one <${interaction.member}>... try again ? <❌>`
        ),
      });

    queue.tracks.shuffle();

    const embed = new EmbedBuilder().setColor("#2f3136").setAuthor({
      name: await Translate(
        `Queue shuffled <${queue.tracks.size}> song(s)! <✅>`
      ),
    });

    return interaction.editReply({ embeds: [embed] });
  },
};
