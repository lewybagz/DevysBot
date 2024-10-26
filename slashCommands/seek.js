const ms = require("ms");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");
const { Translate } = require("../process_tools");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("Go back or forward in a song")
    .addStringOption((option) =>
      option
        .setName("time")
        .setDescription("The time to skip to (e.g., 1:30, 2:45)")
        .setRequired(true)
    ),

  async execute({ interaction }) {
    const queue = useQueue(interaction.guild);
    if (!queue?.isPlaying())
      return interaction.editReply({
        content: await Translate(
          `No music currently playing <${interaction.editReply}>... try again ? <❌>`
        ),
      });

    const timeToMS = ms(interaction.options.getString("time"));
    if (timeToMS >= queue.currentTrack.durationMS) {
      return interaction.editReply({
        content: await Translate(
          `The indicated time is higher than the total time of the current song <${interaction.member}>... try again ? <❌\n> *Try for example a valid time like <**5s, 10s, 20 seconds, 1m**>...*`
        ),
      });
    }

    await queue.node.seek(timeToMS);

    const embed = new EmbedBuilder().setColor("#2f3136").setAuthor({
      name: await Translate(
        `Time set on the current song <**${ms(timeToMS, {
          long: true,
        })}**> <✅>`
      ),
    });

    interaction.editReply({ embeds: [embed] });
  },
};
