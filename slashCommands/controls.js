const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("music")
    .setDescription("Control music playback")
    .addSubcommand((subcommand) =>
      subcommand.setName("skip").setDescription("Skips the current song")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("pause").setDescription("Pauses the current song")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("resume").setDescription("Resumes the current song")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("stop")
        .setDescription("Stops playback and clears the queue")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("repeat").setDescription("Toggles repeat mode")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("shuffle").setDescription("Shuffles the playlist")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("queue").setDescription("Shows the current song queue")
    ),
  execute: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guild);

    if (!queue) {
      await interaction.reply("There is no song playing.");
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "queue": {
        const currentQueue = queue.tracks
          .slice(0, 10)
          .map((track, i) => {
            return `${i + 1}. **${track.title}** - ${track.duration}`;
          })
          .join("\n");

        const embed = new EmbedBuilder()
          .setTitle("Current Queue")
          .setDescription(currentQueue || "No songs in queue")
          .setColor("#1ED760")
          .addFields({
            name: "Now Playing",
            value: `**${queue.current.title}** - ${queue.current.duration}`,
          });

        if (queue.tracks.length > 10) {
          embed.setFooter({ text: `And ${queue.tracks.length - 10} more...` });
        }

        await interaction.reply({ embeds: [embed] });
        break;
      }
      case "skip": {
        const currentSong = queue.current;
        queue.skip();
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`Skipped **${currentSong.title}**`)
              .setThumbnail(currentSong.thumbnail)
              .setColor("#FF0000"),
          ],
        });
        break;
      }
      case "pause": {
        const currentSong = queue.current;

        queue.pause();
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`Paused **${currentSong.title}**`)
              .setColor("#FFA500"),
          ],
        });
        break;
      }
      case "resume": {
        const currentSong = queue.current;
        queue.resume();
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`Resumed **${currentSong.title}**`)
              .setColor("#00FF00"),
          ],
        });
        break;
      }
      case "stop":
        queue.stop();
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("Stopped playback and cleared the queue.")
              .setColor("#FF0000"),
          ],
        });
        break;
      case "repeat": {
        const repeatMode = queue.setRepeatMode((queue.repeatMode + 1) % 3);
        const modes = ["Off", "Track", "Queue"];
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`Set repeat mode to: ${modes[repeatMode]}`)
              .setColor("#0000FF"),
          ],
        });
        break;
      }
      case "shuffle":
        queue.shuffle();
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("Shuffled the playlist.")
              .setColor("#800080"),
          ],
        });
        break;
    }
  },
};
