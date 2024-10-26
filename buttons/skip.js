const { Translate } = require("../process_tools");

module.exports = async ({ interaction, queue }) => {
  if (!queue?.isPlaying())
    return interaction.editReply({
      content: await Translate(
        `No music currently playing... try again ? <❌>`
      ),
    });

  const success = queue.node.skip();

  return interaction.editReply({
    content: success
      ? await Translate(
          `Current music <${queue.currentTrack.title}> skipped <✅>`
        )
      : await Translate(
          `Something went wrong <${interaction.member}>... try again ? <❌>`
        ),
  });
};
