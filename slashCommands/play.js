const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const { EmbedBuilder } = require("discord.js");
const play = require("play-dl");

let player;

async function handlePlayCommand(interaction, client, musicState) {
  const url = interaction.options.getString("url");
  const voiceChannel = interaction.member.voice.channel;
  const guildId = interaction.guild.id;

  if (!voiceChannel) {
    return interaction.reply(
      "You need to be in a voice channel to use this command!"
    );
  }

  // Check if the provided URL is a valid YouTube link
  if (!play.yt_validate(url)) {
    return interaction.reply(
      "Please provide a valid YouTube video or playlist link."
    );
  }

  let { connection, playlistQueue } = musicState.get(guildId);

  // Join the voice channel
  if (!connection) {
    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });
    musicState.set(guildId, { connection, playlistQueue });
  }

  if (play.is_playlist(url)) {
    const playlist = await play.playlist_info(url);
    playlistQueue.push(...playlist.videos.map((video) => video.url));
    musicState.set(guildId, { connection, playlistQueue });
  } else {
    playlistQueue.push(url);
    musicState.set(guildId, { connection, playlistQueue });
  }

  // Create the player only if it doesn't exist already
  if (!player) {
    player = createAudioPlayer();
  }
  connection.subscribe(player);

  // Play the provided video or fetch playlist first video
  await playVideo(url, player, connection, interaction, client);
}

async function playVideo(url, player, connection, interaction, client) {
  try {
    // Fetch video stream
    const streamInfo = await play.stream(url);
    const resource = createAudioResource(streamInfo.stream, {
      inputType: streamInfo.type,
    });

    // Play the current video
    player.play(resource);

    // Send the response to the user
    const videoInfo = await play.video_info(url);

    const embed = new EmbedBuilder()
      .setColor("#1E90FF") // Blue color
      .setTitle("Now Playing")
      .setDescription(`**${videoInfo.video_details.title}**`) // Bold song title
      .setURL(videoInfo.video_details.url) // URL to the video
      .setTimestamp(); // Adds a timestamp at the bottom of the embed

    // Send the embedded message as a follow-up
    await interaction.followUp({ embeds: [embed] });

    // Set custom activity for the bot (Now playing: video title)
    client.user.setActivity(`Listening to: ${videoInfo.video_details.title}`, {
      type: "LISTENING",
    });

    // Handle when the current video ends
    player.on(AudioPlayerStatus.Idle, async () => {
      // Fetch related videos
      const relatedVideos = await play.related(url);
      if (relatedVideos && relatedVideos.length > 0) {
        const nextVideo = relatedVideos[0]; // Get the first related video
        await playVideo(nextVideo.url, player, connection, interaction); // Play the next related video
      } else {
        await interaction.followUp("No related videos found. Disconnecting...");
        client.user.setActivity(
          "Playing Operation LoveCraft: Fallen Doll(Ranked)",
          { type: "PLAYING" }
        );
        connection.destroy(); // Leave the voice channel if no related videos are found
      }
    });
  } catch (error) {
    console.error(`Error playing video: ${error}`);
    connection.destroy(); // Leave the voice channel on error
  }
}

module.exports = { handlePlayCommand, getPlayer: () => player };
