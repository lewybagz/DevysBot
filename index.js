require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const config = require("./config.js");
const { handleGiveawayCommand } = require("./slashCommands/giveaway.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// Event handlers
client.once("ready", () => require("./events/ready.js")(client));
client.on("guildMemberAdd", require("./events/guildMemberAdd.js"));

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "giveaway") {
    await handleGiveawayCommand(interaction);
  }
});

client.on("guildMemberUpdate", require("./events/guildMemberUpdate.js"));

client.login(config.token);
