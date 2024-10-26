const { QueueRepeatMode } = require("discord-player");
const { Translate } = require("../process_tools");

module.exports = async ({ interaction, queue }) => {
  const methods = ["disabled", "track", "queue"];
  if (!queue?.isPlaying())
    return interaction.editReply({
      content: await Translate(
        `No music currently playing... try again ? <❌>`
      ),
    });

  if (queue.repeatMode === 2) queue.setRepeatMode(QueueRepeatMode.OFF);
  else queue.setRepeatMode(queue.repeatMode + 1);

  return interaction.editReply({
    content: await Translate(
      `Loop made has been set to <**${methods[queue.repeatMode]}**>.<✅>`
    ),
  });
};
