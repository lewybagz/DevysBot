const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");
const { Translate } = require("../process_tools");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skipto")
    .setDescription("Skips to particular track in queue")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("The name/url of the track you want to skip to")
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("The place in the queue the song is in")
        .setRequired(false)
        .setMinValue(1)
    ),

  async execute({ interaction }) {
    const queue = useQueue(interaction.guild);
    if (!queue?.isPlaying())
      return interaction.editReply({
        content: await Translate(
          `No music currently playing <${interaction.member}>... try again ? <❌>`
        ),
      });

    const track = interaction.options.getString("song");
    const number = interaction.options.getNumber("number");
    if (!track && !number)
      return interaction.editReply({
        content: await Translate(
          `You have to use one of the options to jump to a song <${interaction.member}>... try again ? <❌>`
        ),
      });

    let trackName;

    if (track) {
      const skipTo = queue.tracks
        .toArray()
        .find(
          (t) =>
            t.title.toLowerCase() === track.toLowerCase() || t.url === track
        );
      if (!skipTo)
        return interaction.editReply({
          content: await Translate(
            `Could not find <${track}> <${interaction.member}>... try using the url or the full name of the song ? <❌>`
          ),
        });

      trackName = skipTo.title;

      queue.node.skipTo(skipTo);
    } else if (number) {
      const index = number - 1;
      const name = queue.tracks.toArray()[index].title;
      if (!name)
        return interaction.editReply({
          content: await Translate(
            `This track does not seem to exist <${interaction.member}>... try again ? <❌>`
          ),
        });

      trackName = name;

      queue.node.skipTo(index);
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: await Translate(`Skipped to <${trackName}> <✅>`) })
      .setColor("#2f3136");

    interaction.editReply({ embeds: [embed] });
  },
};
