const { EmbedBuilder } = require("discord.js");
const { Translate } = require("../process_tools");
const config = require("../config");

module.exports = (queue, track) => {
  if (!config.app.extraMessages) return;

  (async () => {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: await Translate(`Track <${track.title}> added in the queue <✅>`),
        iconURL: track.thumbnail,
      })
      .setColor("#2f3136");

    queue.metadata.channel.send({ embeds: [embed] });
  })();
};
