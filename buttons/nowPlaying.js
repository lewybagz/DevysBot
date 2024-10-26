const { EmbedBuilder } = require("discord.js");
const { Translate } = require("../process_tools");

module.exports = async ({ client, interaction, queue }) => {
  if (!queue?.isPlaying())
    return interaction.editReply({
      content: await Translate(
        `No music currently playing... try again ? <❌>`
      ),
    });

  const track = queue.currentTrack;
  const methods = ["disabled", "track", "queue"];
  const timestamp = track.duration;
  const trackDuration =
    timestamp.progress == "Infinity" ? "infinity (live)" : track.duration;
  const progress = queue.node.createProgressBar();

  const embed = new EmbedBuilder()
    .setAuthor({
      name: track.title,
      iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }),
    })
    .setThumbnail(track.thumbnail)
    .setDescription(
      await Translate(
        `Volume <**${
          queue.node.volume
        }**%\n> <Duration **${trackDuration}**\n> <Progress ${progress}\n> <Loop mode **${
          methods[queue.repeatMode]
        }**\n> <Requested by ${track.requestedBy}>`
      )
    )
    .setFooter({
      text: "Music comes first - Made with heart by Zerio ❤️",
      iconURL: interaction.member.avatarURL({ dynamic: true }),
    })
    .setColor("ff0000")
    .setTimestamp();

  interaction.editReply({ embeds: [embed] });
};
