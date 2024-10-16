const { Client, GatewayIntentBits, Collection } = require("discord.js");
const config = require("./config.js");
const { Player } = require("discord-player");
const { YouTubeExtractor } = require("@discord-player/extractor");
const loadEvents = require("./utils/loadEvents");
const cacheManager = require("./utils/cacheManager");
const initCaptchaVerification = require("./events/guildMemberAdd");
const XPSystem = require("./utils/xpSystem");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});
const fs = require("fs");
const path = require("path");

client.commands = new Collection();

const xpSystem = new XPSystem(client);

async function initializeBot() {
  console.log("Initializing bot...");
  //
  // Load commands into memory
  // eslint-disable-next-line no-undef
  const commandsPath = path.join(__dirname, "slashCommands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }

  client.player = new Player(client, {
    ytdlOptions: {
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    },
    opusEncoder: require("opusscript"),
  });

  // Load extractors
  await client.player.extractors.loadDefault();
  await client.player.extractors.register(YouTubeExtractor, {});

  client.xpSystem = new XPSystem(client);
  await client.xpSystem.loadXPData();
  client.xpSystem.startVoiceXPTracker();

  // Dynamically load all events
  loadEvents(client);
  initCaptchaVerification(client);

  await client.login(config.token);
  console.log("Bot initialized and logged in");
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute({ interaction, client });
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  await xpSystem.addXP(
    user.id,
    reaction.message.guild.id,
    xpSystem.messageXPAmount
  );
});

module.exports = (oldPresence, newPresence) => {
  if (oldPresence?.status !== newPresence?.status) {
    cacheManager.updatePresence(newPresence.userId, newPresence.status);
  }
};

client.on("guildMemberUpdate", require("./events/guildMemberUpdate.js"));

initializeBot().catch(console.error);
