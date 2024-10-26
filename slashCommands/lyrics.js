const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useMainPlayer, useQueue } = require("discord-player");
const { Translate } = require("../process_tools");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Get the lyrics for the current track"),
  async execute({ interaction }) {
    const player = useMainPlayer();
    const queue = useQueue(interaction.guild);
    if (!queue?.isPlaying())
      return interaction.editReply({
        content: await Translate(
          `No music currently playing <${interaction.member}>... try again ? <❌>`
        ),
      });

    const results = await player.lyrics
      .search({
        q: queue.currentTrack.title,
      })
      .catch(async (e) => {
        console.log(e);
        return interaction.editReply({
          content: await Translate(`Error! Please contact Developers! | <❌>`),
        });
      });

    const lyrics = results?.[0];
    if (!lyrics?.plainLyrics)
      return interaction.editReply({
        content: await Translate(
          `No lyrics found for <${queue.currentTrack.title}>... try again ? <❌>`
        ),
      });

    const trimmedLyrics = lyrics.plainLyrics.substring(0, 1997);

    const embed = new EmbedBuilder()
      .setTitle(await Translate(`Lyrics for <${queue.currentTrack.title}>`))
      .setAuthor({
        name: lyrics.artistName,
      })
      .setDescription(
        trimmedLyrics.length === 1997 ? `${trimmedLyrics}...` : trimmedLyrics
      )
      .setFooter({
        text: await Translate(
          "Music comes first - Made with heart by the Community <❤️>"
        ),
        iconURL: interaction.member.avatarURL({ dynamic: true }),
      })
      .setTimestamp()
      .setColor("#2f3136");

    return interaction.editReply({ embeds: [embed] });
  },
};
