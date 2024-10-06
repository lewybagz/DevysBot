require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const config = require("./config.js");
const { handleGiveawayCommand } = require("./slashCommands/giveaway.js");
const { handlePlayCommand } = require("./slashCommands/play.js");
const {
  handlePauseCommand,
  handleResumeCommand,
  handleStopCommand,
  handleSkipCommand,
  handleRepeatCommand,
  handleShuffleCommand,
} = require("./slashCommands/controls");
const loadEvents = require("./utils/loadEvents");
const { getPlayer } = require("./slashCommands/play");
const cacheManager = require("./utils/cacheManager");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

// Dynamically load all events
loadEvents(client);

const musicState = new Map();

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const guildId = interaction.guild.id;

  const player = getPlayer();

  if (!musicState.has(guildId)) {
    musicState.set(guildId, { connection: null, playlistQueue: [] });
  }

  const { connection, playlistQueue } = musicState.get(guildId);

  if (interaction.commandName === "giveaway") {
    await handleGiveawayCommand(interaction);
  } else if (interaction.commandName === "play") {
    await handlePlayCommand(interaction);
  } else if (interaction.commandName === "pause") {
    await handlePauseCommand(interaction, player);
  } else if (interaction.commandName === "resume") {
    await handleResumeCommand(interaction, player);
  } else if (interaction.commandName === "stop") {
    await handleStopCommand(interaction, player, connection);
  } else if (interaction.commandName === "skip") {
    await handleSkipCommand(interaction, player, connection, playlistQueue);
  } else if (interaction.commandName === "repeat") {
    await handleRepeatCommand(interaction);
  } else if (interaction.commandName === "shuffle") {
    await handleShuffleCommand(interaction);
  }
});

module.exports = (oldPresence, newPresence) => {
  if (oldPresence?.status !== newPresence?.status) {
    cacheManager.updatePresence(newPresence.userId, newPresence.status);
  }
};

client.on("guildMemberUpdate", require("./events/guildMemberUpdate.js"));

client.login(config.token);
