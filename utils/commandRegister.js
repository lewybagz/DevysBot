const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const { token, clientId } = require("../config.js");

function buildCommands(cacheManager) {
  console.log("Building commands...");
  const commands = [
    new SlashCommandBuilder()
      .setName("giveaway")
      .setDescription("Starts a giveaway among users with a specific role")
      .addIntegerOption((option) =>
        option
          .setName("winners")
          .setDescription("Number of winners")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("roles")
          .setDescription("Roles to include in the giveaway")
          .setRequired(false)
          .addChoices(
            ...cacheManager
              .getAllRoles()
              .map((role) => ({ name: role.name, value: role.id }))
          )
      ),
    new SlashCommandBuilder()
      .setName("play")
      .setDescription("Play a YouTube video or playlist in a voice channel")
      .addStringOption((option) =>
        option
          .setName("url")
          .setDescription("The YouTube video or playlist URL")
          .setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName("pause")
      .setDescription("Pause the currently playing track"),
    new SlashCommandBuilder()
      .setName("resume")
      .setDescription("Resume the currently paused track"),
    new SlashCommandBuilder()
      .setName("stop")
      .setDescription("Stop the track and disconnect"),
    new SlashCommandBuilder()
      .setName("skip")
      .setDescription("Skip the current track"),
    new SlashCommandBuilder()
      .setName("repeat")
      .setDescription("Toggle repeat mode"),
    new SlashCommandBuilder()
      .setName("shuffle")
      .setDescription("Toggle shuffle mode for playlists"),
  ].map((command) => command.toJSON());
  console.log(`Built ${commands.length} commands`);
  return commands;
}

async function registerCommands(cacheManager) {
  const commands = buildCommands(cacheManager);
  const rest = new REST({ version: "10" }).setToken(token);

  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Error registering commands:", error);
  }
}

module.exports = { registerCommands };
