const config = require("../config");
const { Collection } = require("discord.js");

const userMessageMap = new Collection();
const userMessageCache = new Collection();
const TIMEOUT_DURATION = 30 * 60 * 1000;
const MESSAGE_LIMIT = 5;
const TIME_FRAME = 10000;

async function handleAntiSpam(message) {
  if (!message || !message.guild || !message.author || message.author.bot)
    return;

  const guild = message.guild;
  const timeoutRoleId = config.timeoutRoleId;

  if (!userMessageMap.has(message.author.id)) {
    userMessageMap.set(message.author.id, []);
    userMessageCache.set(message.author.id, []);
  }

  const timestamps = userMessageMap.get(message.author.id);
  const messageCache = userMessageCache.get(message.author.id);
  const now = Date.now();
  timestamps.push(now);
  messageCache.push(message);

  while (timestamps.length > 0 && now - timestamps[0] > TIME_FRAME) {
    timestamps.shift();
    messageCache.shift();
  }

  if (timestamps.length >= MESSAGE_LIMIT) {
    try {
      const member = await guild.members.fetch(message.author.id);
      const timeoutRole = await guild.roles.fetch(timeoutRoleId);

      if (member && timeoutRole) {
        await member.roles.add(timeoutRole);
        await message.channel.send(
          `${message.author}, you've been placed in a timeout for spamming and being naughty.`
        );

        for (const msg of messageCache) {
          if (msg.deletable) {
            await msg.delete().catch(console.error);
          }
        }

        userMessageMap.delete(message.author.id);
        userMessageCache.delete(message.author.id);

        setTimeout(async () => {
          try {
            await member.roles.remove(timeoutRole);
            await message.channel.send(
              `${message.author}, your timeout has ended. Please follow the server rules and stop being naughty!`
            );
          } catch (error) {
            console.error("Error removing timeout role:", error);
          }
        }, TIMEOUT_DURATION);
      } else {
        console.error("Member or timeout role not found");
      }
    } catch (error) {
      console.error("Error in handleAntiSpam:", error);
    }

    userMessageMap.delete(message.author.id);
  }
}

module.exports = { handleAntiSpam };
