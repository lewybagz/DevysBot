const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");
const { Translate } = require("../process_tools");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription("See the history of the queue"),

  async execute({ interaction }) {
    const queue = useQueue(interaction.guild);

    if (!queue || queue.history.tracks.toArray().length == 0)
      return interaction.editReply({
        content: await Translate(`No music has been played yet`),
      });

    const tracks = queue.history.tracks.toArray();

    let description = tracks
      .slice(0, 20)
      .map((track, index) => {
        return `**${index + 1}.** [${track.title}](${track.url}) by ${
          track.author
        }`;
      })
      .join("\r\n\r\n");

    let historyEmbed = new EmbedBuilder()
      .setTitle(`History`)
      .setDescription(description)
      .setColor("#2f3136")
      .setTimestamp()
      .setFooter({
        text: await Translate(
          "Music comes first - Made with heart by the Community <❤️>"
        ),
        iconURL: interaction.member.avatarURL({ dynamic: true }),
      });

    interaction.editReply({ embeds: [historyEmbed] });
  },
};
