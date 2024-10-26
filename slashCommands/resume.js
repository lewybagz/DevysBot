const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");
const { Translate } = require("../process_tools");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Play the track"),

  async execute({ interaction }) {
    const queue = useQueue(interaction.guild);
    if (!queue)
      return interaction.editReply({
        content: await Translate(
          `No music currently playing <${interaction.member}>... try again ? <❌>`
        ),
      });

    if (queue.node.isPlaying())
      return interaction.editReply({
        content: await Translate(
          `The track is already running, <${interaction.member}>... try again ? <❌>`
        ),
      });

    const success = queue.node.resume();

    const resumeEmbed = new EmbedBuilder()
      .setAuthor({
        name: success
          ? await Translate(
              `Current music <${queue.currentTrack.title}> resumed <✅>`
            )
          : await Translate(
              `Something went wrong <${interaction.member}>... try again ? <❌>`
            ),
      })
      .setColor("#2f3136");

    return interaction.editReply({ embeds: [resumeEmbed] });
  },
};
