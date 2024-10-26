const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
const { Translate } = require("../process_tools");
const config = require("../config");

module.exports = (queue, track) => {
  if (!config.app.loopMessage && queue.repeatMode !== 0) return;

  let EmojiState = config.app.enableEmojis;

  const emojis = config.emojis;

  (async () => {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: await Translate(
          `Started playing <${track.title}> in <${queue.channel.name}> <🎧>`
        ),
        iconURL: track.thumbnail,
      })
      .setColor("#2f3136");

    const back = new ButtonBuilder()
      .setLabel(EmojiState ? emojis.back : "Back")
      .setCustomId("back")
      .setStyle("Primary");

    const skip = new ButtonBuilder()
      .setLabel(EmojiState ? emojis.skip : "Skip")
      .setCustomId("skip")
      .setStyle("Primary");

    const resumepause = new ButtonBuilder()
      .setLabel(EmojiState ? emojis.ResumePause : "Resume & Pause")
      .setCustomId("resume&pause")
      .setStyle("Danger");

    const loop = new ButtonBuilder()
      .setLabel(EmojiState ? emojis.loop : "Loop")
      .setCustomId("loop")
      .setStyle("Danger");

    const lyrics = new ButtonBuilder()
      .setLabel(await Translate("Lyrics"))
      .setCustomId("lyrics")
      .setStyle("Secondary");

    const row1 = new ActionRowBuilder().addComponents(
      back,
      loop,
      resumepause,
      skip,
      lyrics
    );
    queue.metadata.channel.send({ embeds: [embed], components: [row1] });
  })();
};
