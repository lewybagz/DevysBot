const { Translate } = require("../process_tools");

module.exports = async ({ interaction, queue }) => {
  if (!queue?.isPlaying())
    return interaction.editReply({
      content: await Translate(
        `No music currently playing... try again ? <❌>`
      ),
    });

  const resumed = queue.node.resume();
  let message = await Translate(
    `Current music <${queue.currentTrack.title}> resumed <✅>`
  );

  if (!resumed) {
    queue.node.pause();
    message = await Translate(
      `Current music <${queue.currentTrack.title}> paused <✅>`
    );
  }

  return interaction.editReply({ content: message });
};
