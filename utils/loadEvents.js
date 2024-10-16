const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  // eslint-disable-next-line no-undef
  const eventsPath = path.join(__dirname, "../events");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    const eventModule = require(`../events/${file}`);
    const eventName = file.split(".")[0];
    if (eventName === "ready") {
      client.once(eventName, (...args) => eventModule(client, ...args));
    } else {
      client.on(eventName, (...args) => {
        const handler =
          typeof eventModule === "function" ? eventModule(client) : eventModule;
        if (typeof handler === "function") {
          handler(...args);
        } else {
          console.error(`Invalid event handler for ${eventName}`);
        }
      });
    }
  }
};
