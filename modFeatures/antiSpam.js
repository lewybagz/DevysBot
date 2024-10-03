const config = require("../config"); // Config file to get role IDs
const { Collection } = require("discord.js");

// Anti-spam message tracking
const userMessageMap = new Collection();
const userMessageCache = new Collection(); // Stores messages for each user
const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const MESSAGE_LIMIT = 5; // Max messages before triggering anti-spam
const TIME_FRAME = 10000; // Time frame for message spam detection (10 seconds)

async function handleAntiSpam(message) {
  if (message.author.bot) return; // Ignore bot messages

  const guild = message.guild;
  const timeoutRoleId = config.timeoutRoleId; // Timeout role ID from config

  // Initialize user tracking if it doesn't exist
  if (!userMessageMap.has(message.author.id)) {
    userMessageMap.set(message.author.id, []);
    userMessageCache.set(message.author.id, []); // Cache for user's messages
  }

  // Get the current timestamp and push it to the user's message array
  const timestamps = userMessageMap.get(message.author.id);
  const messageCache = userMessageCache.get(message.author.id); // Cache their messages
  const now = Date.now();
  timestamps.push(now);
  messageCache.push(message);

  // Remove old messages that are outside the time frame
  while (timestamps.length > 0 && now - timestamps[0] > TIME_FRAME) {
    timestamps.shift();
    messageCache.shift(); // Also remove corresponding messages from cache
  }

  // Check if the user has exceeded the message limit within the time frame
  if (timestamps.length >= MESSAGE_LIMIT) {
    // Apply timeout role
    const member = guild.members.cache.get(message.author.id);
    const timeoutRole = guild.roles.cache.get(timeoutRoleId);

    if (member && timeoutRole) {
      await member.roles.add(timeoutRole);
      await message.channel.send(
        `${message.author}, you've been placed in a timeout for spamming and being naughty.`
      );

      // Delete all cached spam messages
      for (const msg of messageCache) {
        if (msg.deletable) {
          await msg.delete();
        }
      }

      // Clear the cached messages and timestamps after deletion
      userMessageMap.delete(message.author.id);
      userMessageCache.delete(message.author.id);

      // Set a timer to remove the timeout role after 30 minutes
      setTimeout(async () => {
        await member.roles.remove(timeoutRole);
        await message.channel.send(
          `${message.author}, your timeout has ended. Please follow the server rules and stop being naughty!.`
        );
      }, TIMEOUT_DURATION);
    }

    // Clear the message tracking for the user after applying the timeout
    userMessageMap.delete(message.author.id);
  }
}

module.exports = { handleAntiSpam };
