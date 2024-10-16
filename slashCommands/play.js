const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { QueryType } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("search")
        .setDescription("Searches for a song.")
        .addStringOption((option) =>
          option
            .setName("searchterms")
            .setDescription("search keywords")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("playlist")
        .setDescription("Plays playlist from YT")
        .addStringOption((option) =>
          option.setName("url").setDescription("playlist url").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("song")
        .setDescription("Plays song from YT")
        .addStringOption((option) =>
          option
            .setName("url")
            .setDescription("url of the song")
            .setRequired(true)
        )
    ),
  execute: async ({ interaction }) => {
    if (!interaction.guild.members.me.permissions.has(['CONNECT', 'SPEAK'])) {
      return interaction.reply({
        content: 'I need permission to connect and speak in this voice channel!',
        ephemeral: true,
      });
    }


    const member =
      interaction.member ??
      (await interaction.guild.members.fetch(interaction.user.id));

    if (!member.voice.channel) {
      await interaction.reply({
        content: "You must be in a voice channel to use this command.",
        ephemeral: true,
      });
      return;
    }
    const client = interaction.client;
    const queue = client.player.nodes.create(interaction.guild, {
      metadata: {
        channel: interaction.channel,
        client: interaction.guild.members.me,
        requestedBy: interaction.user,
      },
      selfDeaf: false, // <--- THIS LINE was true
      volume: 100,
      leaveOnEmpty: true,
      leaveOnEmptyCooldown: 300000,
      leaveOnEnd: true,
      leaveOnEndCooldown: 300000,
    });


    if (!queue.connection) {
      if (!member.voice.channel) {
        await interaction.reply({
          content: "You must be in a voice channel to use this command.",
          ephemeral: true,
        });
        return;
      }
      await queue.connect(member.voice.channel);
    }

    let embed = new EmbedBuilder();

    if (interaction.options.getSubcommand() === "song") {
      let url = interaction.options.getString("url");
      console.log("URL received:", url);

      if (!url) {
        return interaction.reply("Please provide a valid URL.");
      }

      try {
        const result = await client.player.search(url, {
          requestedBy: interaction.user,
          searchEngine: QueryType.AUTO,
        });

        console.log("Search result:", result);

        if (!result || !result.tracks.length) {
          return interaction.reply({
            content: "No results found!",
            ephemeral: true,
          });
        }

        const song = result.tracks[0];
        console.log("Song to be added:", song);

        const queue = client.player.nodes.get(interaction.guild.id) || 
        client.player.nodes.create(interaction.guild, {
          metadata: {
            channel: interaction.channel,
            client: interaction.guild.members.me,
            requestedBy: interaction.user,
          },
          selfDeaf: false,  // Make sure this is set
        });


        try {
          if (!queue.connection)
            await queue.connect(interaction.member.voice.channel);
        } catch {
          client.player.nodes.delete(interaction.guild.id);
          return interaction.reply({
            content: "Could not join your voice channel!",
            ephemeral: true,
          });
        }

        await queue.node.play(song);

        const embed = new EmbedBuilder()
          .setDescription(
            `**[${song.title}](${song.url})** has been added to the Queue`
          )
          .setThumbnail(song.thumbnail)
          .setFooter({ text: `Duration: ${song.duration}` });

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error("Error during song playback:", error);
        return interaction.reply({
          content: "An error occurred while trying to play the song.",
          ephemeral: true,
        });
      }
    } else if (interaction.options.getSubcommand() === "playlist") {
      let url = interaction.options.getString("url");

      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });

      if (!result || !result.tracks.length) {
        return interaction.reply({
          content: "No playlist found!",
          ephemeral: true,
        });
      }

      const playlist = result.playlist;
      await queue.addTracks(result.tracks);

      embed
        .setDescription(
          `Added **[${playlist.title}](${playlist.url})** to the queue.`
        )
        .setThumbnail(playlist.thumbnail)
        .setFooter({ text: `Duration: ${playlist.duration}` });
    } else if (interaction.options.getSubcommand() === "search") {
      let query = interaction.options.getString("searchterms");
      const result = await client.player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });

      if (!result || !result.tracks.length) {
        return interaction.reply("No results found!");
      }

      const song = result.tracks[0];
      await queue.addTrack(song);

      embed
        .setDescription(`Added **[${song.title}](${song.url})** to the queue.`)
        .setThumbnail(song.thumbnails[0].url)
        .setFooter({ text: `Duration: ${song.durationRaw}` });
    }

    console.log('Is the queue playing:', queue.playing);
    if (!queue.playing) await queue.play();


    await interaction.reply({
      embeds: [embed],
    });
  },
};
