const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");
const { Translate } = require("../process_tools");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the track"),

  async execute({ interaction }) {
    const queue = useQueue(interaction.guild);
    if (!queue?.isPlaying())
      return interaction.editReply({
        content: await Translate(
          `No music currently playing <${interaction.member}>... try again ? <❌>`
        ),
      });

    queue.delete();

    const embed = new EmbedBuilder().setColor("#2f3136").setAuthor({
      name: await Translate(
        `Music stopped into this server, see you next time <✅>`
      ),
    });

    return interaction.editReply({ embeds: [embed] });
  },
};
