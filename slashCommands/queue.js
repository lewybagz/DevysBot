const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");
const { Translate } = require("../process_tools");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Get the songs in the queue"),
  async execute({ client, interaction }) {
    const queue = useQueue(interaction.guild);

    if (!queue)
      return interaction.editReply({
        content: await Translate(
          `No music currently playing <${interaction.member}>... try again ? <❌>`
        ),
      });
    if (!queue.tracks.toArray()[0])
      return interaction.editReply({
        content: await Translate(
          `No music in the queue after the current one <${interaction.member}>... try again ? <❌>`
        ),
      });

    const methods = ["", "🔁", "🔂"];
    const songs = queue.tracks.size;
    const nextSongs =
      songs > 5
        ? await Translate(`And <**${songs - 5}**> other song(s)...`)
        : await Translate(`In the playlist <**${songs}**> song(s)...`);
    const tracks = queue.tracks.map(
      (track, i) =>
        `**${i + 1}** - ${track.title} | ${track.author} (requested by : ${
          track.requestedBy ? track.requestedBy.displayName : "unknown"
        })`
    );
    const embed = new EmbedBuilder()
      .setColor("#2f3136")
      .setThumbnail(interaction.guild.iconURL({ size: 2048, dynamic: true }))
      .setAuthor({
        name: await Translate(
          `Server queue - <${interaction.guild.name}> <${
            methods[queue.repeatMode]
          }>`
        ),
        iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }),
      })
      .setDescription(
        await Translate(
          `Current <${queue.currentTrack.title}> <\n\n> <${tracks
            .slice(0, 5)
            .join("\n")}> <\n\n> <${nextSongs}>`
        )
      )
      .setTimestamp()
      .setFooter({
        text: await Translate(
          "Music comes first - Made with heart by the Community <❤️>"
        ),
        iconURL: interaction.member.avatarURL({ dynamic: true }),
      });

    interaction.editReply({ embeds: [embed] });
  },
};
