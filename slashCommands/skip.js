const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");
const { Translate } = require("../process_tools");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the track"),
  async execute({ interaction }) {
    const queue = useQueue(interaction.guild);
    if (!queue?.isPlaying())
      return interaction.editReply({
        content: await Translate(
          `No music currently playing <${interaction.member}>... try again ? <❌>`
        ),
      });

    const success = queue.node.skip();

    const embed = new EmbedBuilder().setColor("#2f3136").setAuthor({
      name: success
        ? await Translate(
            `Current music <${queue.currentTrack.title}> skipped <✅>`
          )
        : await Translate(
            `Something went wrong <${interaction.member}>... try again ? <❌>`
          ),
    });

    return interaction.editReply({ embeds: [embed] });
  },
};
