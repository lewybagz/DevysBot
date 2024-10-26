const { QueueRepeatMode, useQueue } = require("discord-player");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Translate } = require("../process_tools");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Toggle the looping of song's or the whole queue")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("What action you want to perform on the loop")
        .setRequired(true)
        .addChoices(
          { name: "Queue", value: "enable_loop_queue" },
          { name: "Disable", value: "disable_loop" },
          { name: "Song", value: "enable_loop_song" },
          { name: "Autoplay", value: "enable_autoplay" }
        )
    ),

  async execute({ interaction }) {
    const queue = useQueue(interaction.guild);
    const errorMessage = await Translate(
      `Something went wrong <${interaction.member}>... try again ? <❌>`
    );
    let baseEmbed = new EmbedBuilder().setColor("#2f3136");

    if (!queue?.isPlaying())
      return interaction.editReply({
        content: await Translate(
          `No music currently playing <${interaction.member}>... try again ? <❌>`
        ),
      });

    switch (
      interaction.options._hoistedOptions.map((x) => x.value).toString()
    ) {
      case "enable_loop_queue": {
        if (queue.repeatMode === QueueRepeatMode.TRACK)
          return interaction.editReply({
            content: `You must first disable the current music in the loop mode (\`/loop Disable\`) ${interaction.member}... try again ? ❌`,
          });

        const success = queue.setRepeatMode(QueueRepeatMode.QUEUE);
        baseEmbed.setAuthor({
          name: success
            ? errorMessage
            : await Translate(
                `Repeat mode enabled the whole queue will be repeated endlessly <🔁>`
              ),
        });

        return interaction.editReply({ embeds: [baseEmbed] });
      }
      case "disable_loop": {
        if (queue.repeatMode === QueueRepeatMode.OFF)
          return interaction.editReply({
            content: await Translate(
              `You must first enable the loop mode <(/loop Queue or /loop Song)> <${interaction.member}>... try again ? <❌>`
            ),
          });

        const success = queue.setRepeatMode(QueueRepeatMode.OFF);
        baseEmbed.setAuthor({
          name: success
            ? errorMessage
            : await Translate(
                `Repeat mode disabled the queue will no longer be repeated <🔁>`
              ),
        });

        return interaction.editReply({ embeds: [baseEmbed] });
      }
      case "enable_loop_song": {
        if (queue.repeatMode === QueueRepeatMode.QUEUE)
          return interaction.editReply({
            content: await Translate(
              `You must first disable the current music in the loop mode <(\`/loop Disable\`)> <${interaction.member}>... try again ? <❌>`
            ),
          });

        const success = queue.setRepeatMode(QueueRepeatMode.TRACK);
        baseEmbed.setAuthor({
          name: success
            ? errorMessage
            : await Translate(
                `Repeat mode enabled the current song will be repeated endlessly (you can end the loop with <\`/loop disable\` >)`
              ),
        });

        return interaction.editReply({ embeds: [baseEmbed] });
      }
      case "enable_autoplay": {
        if (queue.repeatMode === QueueRepeatMode.AUTOPLAY)
          return interaction.editReply({
            content: await Translate(
              `You must first disable the current music in the loop mode <(\`/loop Disable\`)> <${interaction.member}>... try again ? <❌>`
            ),
          });

        const success = queue.setRepeatMode(QueueRepeatMode.AUTOPLAY);
        baseEmbed.setAuthor({
          name: success
            ? errorMessage
            : await Translate(
                `Autoplay enabled the queue will be automatically filled with similar songs to the current one <🔁>`
              ),
        });

        return interaction.editReply({ embeds: [baseEmbed] });
      }
    }
  },
};
