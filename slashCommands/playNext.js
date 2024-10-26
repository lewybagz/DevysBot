const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { QueryType, useMainPlayer, useQueue } = require("discord-player");
const { Translate } = require("../process_tools");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playnext")
    .setDescription("Play a song right after this one")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("The song you want to play next")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute({ interaction }) {
    const player = useMainPlayer();
    const queue = useQueue(interaction.guild);

    if (!queue?.isPlaying())
      return interaction.editReply({
        content: await Translate(
          `No music currently playing <${interaction.member}>... try again ? <❌>`
        ),
      });

    const song = interaction.options.getString("song");
    const res = await player.search(song, {
      requestedBy: interaction.member,
      searchEngine: QueryType.AUTO,
    });

    if (!res?.tracks.length)
      return interaction.editReply({
        content: await Translate(
          `No results found <${interaction.member}>... try again ? <❌>`
        ),
      });

    if (res.playlist)
      return interaction.editReply({
        content: await Translate(
          `This command dose not support playlist's <${interaction.member}>... try again ? <❌>`
        ),
      });

    queue.insertTrack(res.tracks[0], 0);

    const playNextEmbed = new EmbedBuilder()
      .setAuthor({
        name: await Translate(
          `Track has been inserted into the queue... it will play next <🎧>`
        ),
      })
      .setColor("#2f3136");

    await interaction.editReply({ embeds: [playNextEmbed] });
  },
};
