const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");
const { Translate } = require("../process_tools");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a song from the queue")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("The name/url of the track you want to remove")
        .setRequired(false)
        .setAutocomplete(true)
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

    const number = interaction.options.getNumber("number");
    const track = interaction.options.getString("song");
    if (!track && !number)
      interaction.editReply({
        content: await Translate(
          `You have to use one of the options to remove a song <${interaction.member}>... try again ? <❌>`
        ),
      });

    let trackName;

    if (track) {
      const toRemove = queue.tracks
        .toArray()
        .find((t) => t.title === track || t.url === track);
      if (!toRemove)
        return interaction.editReply({
          content: await Translate(
            `could not find <${track}> <${interaction.member}>... try using the url or the full name of the song ? <❌>`
          ),
        });

      queue.removeTrack(toRemove);
    } else if (number) {
      const index = number - 1;
      const name = queue.tracks.toArray()[index].title;
      if (!name)
        return interaction.editReply({
          content: await Translate(
            `This track does not seem to exist <${interaction.member}>...  try again ? <❌>`
          ),
        });

      queue.removeTrack(index);

      trackName = name;
    }

    const embed = new EmbedBuilder().setColor("#2f3136").setAuthor({
      name: await Translate(`Removed <${trackName}> from the queue <✅>`),
    });

    return interaction.editReply({ embeds: [embed] });
  },
};
