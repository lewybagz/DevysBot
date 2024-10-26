const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { QueryType, useMainPlayer } = require("discord-player");
const { Translate } = require("../process_tools");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search a song")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("The song you want to search")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute({ client, interaction }) {
    const player = useMainPlayer();
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

    const queue = player.nodes.create(interaction.guild, {
      metadata: {
        channel: interaction.channel,
      },
      spotifyBridge: config.opt.spotifyBridge,
      volume: config.opt.defaultvolume,
      leaveOnEnd: config.opt.leaveOnEnd,
      leaveOnEmpty: config.opt.leaveOnEmpty,
    });
    const maxTracks = res.tracks.slice(0, 10);

    const embed = new EmbedBuilder()
      .setColor("#2f3136")
      .setAuthor({
        name: await Translate(`Results for <${song}>`),
        iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }),
      })
      .setDescription(
        await Translate(
          `<${maxTracks
            .map((track, i) => `**${i + 1}**. ${track.title} | ${track.author}`)
            .join("\n")}\n\n> Select choice between <**1**> and <**${
            maxTracks.length
          }**> or <**cancel** ⬇️>`
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

    const collector = interaction.channel.createMessageCollector({
      time: 15000,
      max: 1,
      errors: ["time"],
      filter: (m) => m.author.id === interaction.member.id,
    });

    collector.on("collect", async (query) => {
      collector.stop();
      if (query.content.toLowerCase() === "cancel") {
        return interaction.followUp({
          content: await Translate(`Search cancelled <✅>`),
          ephemeral: true,
        });
      }

      const value = parseInt(query);
      if (!value || value <= 0 || value > maxTracks.length) {
        return interaction.followUp({
          content: await Translate(
            `Invalid response, try a value between <**1**> and <**${maxTracks.length}**> or <**cancel**>... try again ? <❌>`
          ),
          ephemeral: true,
        });
      }

      try {
        if (!queue.connection)
          await queue.connect(interaction.member.voice.channel);
      } catch {
        await player.deleteQueue(interaction.guildId);
        return interaction.followUp({
          content: await Translate(
            `I can't join the voice channel <${interaction.member}>... try again ? <❌>`
          ),
          ephemeral: true,
        });
      }

      await interaction.followUp({
        content: await Translate(`Loading your search... <🎧>`),
        ephemeral: true,
      });

      queue.addTrack(res.tracks[query.content - 1]);

      if (!queue.isPlaying()) await queue.node.play();
    });

    collector.on("end", async (msg, reason) => {
      if (reason === "time")
        return interaction.followUp({
          content: await Translate(
            `Search timed out <${interaction.member}>... try again ? <❌>`
          ),
          ephemeral: true,
        });
    });
  },
};
