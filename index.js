require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const config = require("./config.js");
const { handleGiveawayCommand } = require("./slashCommands/giveaway.js");
const { handlePlayCommand } = require("./slashCommands/play.js");
const loadEvents = require("./utils/loadEvents");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Dynamically load all events
loadEvents(client);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "giveaway") {
    await handleGiveawayCommand(interaction);
  } else if (interaction.commandName === "play") {
    await handlePlayCommand(interaction);
  }
});

client.on("guildMemberUpdate", require("./events/guildMemberUpdate.js"));

client.login(config.token);
