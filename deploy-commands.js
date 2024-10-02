// deploy-commands.js
require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const cacheManager = require("../cacheManager");

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
    // TODO:
    .addStringOption((option) =>
      option
        .setName("roles")
        .setDescription("Roles to include in the giveaway")
        .setRequired(false)
        .addChoices(
          ...cacheManager
            .getAllRoles() // Access the cached roles
            .map((role) => ({ name: role.name, value: role.id }))
        )
    ),
].map((command) => command.toJSON());

const token = require("./config.js").token;
const clientId = require("./config.js").clientId;

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
