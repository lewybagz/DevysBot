const fs = require("fs");
const path = require("path");

const __dirname = path.resolve();

module.exports = (client) => {
  // Get all event files in the 'events' directory
  const eventsPath = path.join(__dirname, "../events"); // __dirname works in CommonJS
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

  // Register each event
  for (const file of eventFiles) {
    const event = require(`../events/${file}`);
    const eventName = file.split(".")[0]; // Get event name without file extension

    if (eventName === "ready") {
      // Special case for 'ready' event as it uses 'once'
      client.once(eventName, (...args) => event(client, ...args));
    } else {
      client.on(eventName, (...args) => event(client, ...args));
    }
  }
};
