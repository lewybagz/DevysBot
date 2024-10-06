const { createAudioResource } = require("@discordjs/voice");
const { sendVoiceChannelEmbed } = require("../utils/sendEmbed"); // Assuming the embed function is in utils
const play = require("play-dl"); // To fetch YouTube videos and playlists
const { musicGuard } = require("../utils/musicGuard");

let isRepeating = false; // Track repeat mode
let isShuffling = false; // Track shuffle mode
let playlistQueue = []; // Store playlist for shuffling

async function handlePauseCommand(interaction, player) {
  musicGuard(interaction, player, () => {
    player.pause();
    sendVoiceChannelEmbed(
      interaction,
      "The track has been paused.",
      "#FFA500",
      "🟠"
    ); // Orange color for pause
  });
}

async function handleResumeCommand(interaction, player) {
  musicGuard(interaction, player, () => {
    if (player.state.status !== "paused") {
      return interaction.reply("The track is not paused.");
    }
    player.unpause();
    sendVoiceChannelEmbed(
      interaction,
      "The track has resumed playing.",
      "#00FF00",
      "🟢"
    ); // Green color for resume
  });
}

async function handleStopCommand(interaction, player, connection) {
  musicGuard(interaction, player, () => {
    player.stop();
    connection.destroy(); // Disconnect from the voice channel
    sendVoiceChannelEmbed(
      interaction,
      "The track has been stopped and the bot has left the voice channel.",
      "#FF0000",
      "🔴"
    ); // Red color for stop
  });
}

async function handleSkipCommand(
  interaction,
  player,
  connection,
  playlistQueue
) {
  musicGuard(interaction, player, async () => {
    if (playlistQueue.length > 0) {
      const nextTrack = isShuffling
        ? playlistQueue.splice(
            Math.floor(Math.random() * playlistQueue.length),
            1
          )[0]
        : playlistQueue.shift();
      await playVideo(nextTrack, player, connection, interaction);
      sendVoiceChannelEmbed(
        interaction,
        `Skipping to the next track: **${nextTrack.title}**.`,
        "#00FFFF",
        "🔵"
      ); // Cyan color for skip
    } else {
      player.stop();
      sendVoiceChannelEmbed(
        interaction,
        "No more tracks to skip to.",
        "#00FFFF",
        "🔵"
      );
    }
  });
}

async function handleRepeatCommand(interaction, player) {
  musicGuard(interaction, player, () => {
    isRepeating = !isRepeating;
    const status = isRepeating ? "enabled" : "disabled";
    sendVoiceChannelEmbed(
      interaction,
      `Repeat has been ${status}.`,
      "#FFFF00",
      "🟡"
    ); // Yellow color for repeat
  });
}

async function handleShuffleCommand(interaction, player) {
  musicGuard(interaction, player, () => {
    if (playlistQueue.length > 1) {
      isShuffling = !isShuffling;
      const status = isShuffling ? "enabled" : "disabled";
      sendVoiceChannelEmbed(
        interaction,
        `Shuffle has been ${status} for this playlist.`,
        "#00FF00",
        "🔀"
      ); // Green color for shuffle
    } else {
      sendVoiceChannelEmbed(
        interaction,
        "Shuffle is only available for playlists.",
        "#FFA500",
        "🟠"
      );
    }
  });
}

async function playVideo(url, player, connection, interaction) {
  try {
    const streamInfo = await play.stream(url);
    const resource = createAudioResource(streamInfo.stream, {
      inputType: streamInfo.type,
    });

    player.play(resource);
    const videoInfo = await play.video_info(url);
    sendVoiceChannelEmbed(
      interaction,
      `Now playing: **${videoInfo.video_details.title}**.`,
      "#1E90FF",
      "🎶"
    ); // Blue color for playing
  } catch (error) {
    console.error(`Error playing video: ${error}`);
    sendVoiceChannelEmbed(
      interaction,
      "There was an error playing the video.",
      "#FF0000",
      "⚠️"
    );
    connection.destroy(); // Disconnect on error
  }
}

module.exports = {
  handlePauseCommand,
  handleResumeCommand,
  handleStopCommand,
  handleSkipCommand,
  handleRepeatCommand,
  handleShuffleCommand,
};
