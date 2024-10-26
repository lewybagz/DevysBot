const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  // eslint-disable-next-line no-undef
  const eventsPath = path.join(__dirname, "../events");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    const event = require(`../events/${file}`);
    const eventName = file.split(".")[0];

    if (eventName === "ready") {
      client.once(eventName, (...args) => event(client, ...args));
    } else {
      client.on(eventName, async (...args) => event(client, ...args));
    }
  }
};
