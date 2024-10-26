const config = require("../config");
const maxVol = config.opt.maxVol;
const { SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");
const { Translate } = require("../process_tools");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Adjust the volume")
    .addIntegerOption((option) =>
      option
        .setName("volume")
        .setDescription("The new volume (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(maxVol)
    ),

  async execute({ interaction }) {
    const queue = useQueue(interaction.guild);
    if (!queue?.isPlaying())
      return interaction.editReply({
        content: await Translate(
          `No music currently playing <${interaction.member}>... try again ? <❌>`
        ),
      });

    const vol = interaction.options.getNumber("volume");
    if (queue.node.volume === vol)
      return interaction.editReply({
        content: await Translate(
          `The new volume is already the current one <${interaction.member}>... try again ? <❌>`
        ),
      });

    const success = queue.node.setVolume(vol);

    return interaction.editReply({
      content: success
        ? await Translate(
            `The volume has been modified to <${vol}/${maxVol}%> <🔊>`
          )
        : `Something went wrong ${interaction.member}... try again ? ❌`,
    });
  },
};
