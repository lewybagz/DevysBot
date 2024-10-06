function musicGuard(interaction, player, next) {
  if (
    !player ||
    (player.state.status !== "playing" && player.state.status !== "paused")
  ) {
    return interaction.reply("No track is currently playing.");
  }
  return next(); // Proceed to the command handler if music is playing or paused
}

module.exports = { musicGuard };
