const { Translate } = require("../process_tools");

const maxVol = 100;

module.exports = async ({ interaction, queue }) => {
  if (!queue?.isPlaying())
    return interaction.editReply({
      content: await Translate(
        `No music currently playing... try again ? <❌>`
      ),
    });

  const vol = Math.floor(queue.node.volume - 5);
  if (vol < 0)
    return interaction.editReply({
      content: await Translate(
        `I can not move the volume down any more <${interaction.member}>... try again ? <❌>`
      ),
    });
  if (queue.node.volume === vol)
    return interaction.editReply({
      content: await Translate(
        `The volume you want to change is already the current one <${interaction.member}>... try again ? <❌>`
      ),
    });

  const success = queue.node.setVolume(vol);
  return interaction.editReply({
    content: success
      ? await Translate(
          `The volume has been modified to <${vol}/${maxVol}% 🔊>`
        )
      : await Translate(
          `Something went wrong <${interaction.member}>... try again ? <❌>`
        ),
  });
};
