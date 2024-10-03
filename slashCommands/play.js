const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const play = require("play-dl");

async function handlePlayCommand(interaction, client) {
  const url = interaction.options.getString("url");
  const voiceChannel = interaction.member.voice.channel;

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

  // Join the voice channel
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: interaction.guild.id,
    adapterCreator: interaction.guild.voiceAdapterCreator,
  });

  // Create an audio player
  const player = createAudioPlayer();
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
    await interaction.followUp(
      `Now playing: **${videoInfo.video_details.title}**`
    );

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

module.exports = { handlePlayCommand };
