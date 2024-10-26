const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const config = require("./config.js"); // Adjust path as needed

const rest = new REST().setToken(config.token);

async function clearAndDeployCommands() {
  try {
    console.log("Starting command cleanup and registration...");

    // Delete all global commands
    console.log("Deleting all global commands...");
    await rest.put(Routes.applicationCommands(config.app.id), { body: [] });
    console.log("Successfully deleted all global commands");

    // Delete guild-specific commands if you have any
    // Replace GUILD_ID with your server ID, or add multiple server IDs in an array
    const guilds = [config.guildId]; // Add your guild IDs here
    for (const guildId of guilds) {
      console.log(`Deleting commands for guild ${guildId}...`);
      await rest.put(Routes.applicationGuildCommands(config.app.id, guildId), {
        body: [],
      });
      console.log(`Successfully deleted all commands from guild ${guildId}`);
    }

    // Load and register new commands
    const commands = [];
    // eslint-disable-next-line no-undef
    const commandsPath = path.join(__dirname, "slashCommands");
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));

    console.log("\nLoading new commands...");
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
        console.log(`Loaded command: ${command.data.name}`);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing required properties`
        );
      }
    }

    // Register new global commands
    console.log("\nRegistering new commands...");
    const data = await rest.put(Routes.applicationCommands(config.app.id), {
      body: commands,
    });

    console.log(`Successfully registered ${data.length} commands:`);
    data.forEach((cmd) => console.log(` - ${cmd.name}`));
  } catch (error) {
    console.error("Error during command cleanup and registration:", error);
  }
}

// Run the cleanup and deployment
clearAndDeployCommands();
