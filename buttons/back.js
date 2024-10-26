const { Translate } = require("../process_tools");

module.exports = async ({ interaction, queue }) => {
  if (!queue?.isPlaying())
    return interaction.editReply({
      content: await Translate(
        `No music currently playing... try again ? <❌>`
      ),
    });
  if (!queue.history.previousTrack)
    return interaction.editReply({
      content: await Translate(
        `There was no music played before <${interaction.member}>... try again ? <❌>`
      ),
    });

  await queue.history.back();

  interaction.editReply({
    content: await Translate(`Playing the <**previous**> track <✅>`),
  });
};
