const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");
const { Translate } = require("../process_tools");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("save")
    .setDescription("Save the current track!"),
  async execute({ interaction }) {
    const queue = useQueue(interaction.guild);
    if (!queue?.isPlaying())
      return interaction.editReply({
        content: await Translate(
          `No music currently playing <${interaction.member}>... try again ? <❌>`
        ),
      });

    const embed = new EmbedBuilder()
      .setColor("#2f3136")
      .setTitle(`:arrow_forward: ${queue.currentTrack.title}`)
      .setURL(queue.currentTrack.url)
      .addFields(
        {
          name: await Translate("Duration <:hourglass:>"),
          value: `\`${queue.currentTrack.duration}\``,
          inline: true,
        },
        {
          name: await Translate("Song by:"),
          value: `\`${queue.currentTrack.author}\``,
          inline: true,
        },
        {
          name: await Translate("Views <:eyes:>"),
          value: `\`${Number(queue.currentTrack.views).toLocaleString()}\``,
          inline: true,
        },
        {
          name: await Translate("Song <URL>:"),
          value: `\`${queue.currentTrack.url}\``,
        }
      )
      .setThumbnail(queue.currentTrack.thumbnail)
      .setFooter({
        text: await Translate(
          `From the server <${interaction.member.guild.name}>`
        ),
        iconURL: interaction.member.guild.iconURL({ dynamic: false }),
      });

    interaction.member
      .send({ embeds: [embed] })
      .then(async () => {
        return interaction.editReply({
          content: await Translate(
            `I have sent you the music in private messages <✅>`
          ),
        });
      })
      .catch(async () => {
        return interaction.editReply({
          content: await Translate(
            `Unable to send you a private message... try again ? <❌>`
          ),
        });
      });
  },
};
