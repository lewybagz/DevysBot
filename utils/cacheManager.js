// cacheManager.js
const { Collection } = require("discord.js");

class CacheManager {
  constructor() {
    this.users = new Collection();
    this.roles = new Collection(); // New collection for roles
    this.peakOnline = 0;
    this.onlineCount = 0;
  }

  async cacheGuildRoles(guild) {
    if (!guild || !guild.roles) {
      console.error("Invalid guild object provided to cacheGuildRoles");
      return;
    }
    try {
      const roles = await guild.roles.fetch();
      this.roles = roles;
      console.log(`Cached ${this.roles.size} roles from guild ${guild.name}.`);
    } catch (error) {
      console.error(`Error caching guild roles for ${guild.name}:`, error);
    }
  }

  // Get all roles (for dropdown menu)
  getAllRoles() {
    return this.roles.map((role) => role); // Directly use map
  }

  // Cache all members when the bot joins the guild
  async cacheGuildMembers(guild) {
    if (!guild || !guild.members) {
      console.error("Invalid guild object provided to cacheGuildMembers");
      return;
    }
    try {
      const members = await guild.members.fetch();
      let guildOnlineCount = 0;
      members.forEach((member) => {
        this.cacheMember(member);
        if (this.isOnline(member)) {
          guildOnlineCount++;
        }
      });
      console.log(
        `Cached ${members.size} members from guild ${guild.name}. Online: ${guildOnlineCount}`
      );
      return guildOnlineCount;
    } catch (error) {
      console.error(`Error caching guild members for ${guild.name}:`, error);
      return 0;
    }
  }

  // Add a new member to the cache
  cacheMember(member) {
    if (!member || !member.user) {
      console.error("Invalid member object provided to cacheMember");
      return;
    }
    const roles = member.roles.cache.map((role) => role.id);
    const presence = member.presence?.status || "offline";
    this.users.set(member.id, {
      username: member.user.username,
      profilePicture: member.user.displayAvatarURL({ dynamic: true }),
      roles,
      presence,
    });

    if (presence === "online") {
      this.onlineCount++;
      if (this.onlineCount > this.peakOnline) {
        this.peakOnline = this.onlineCount;
      }
    }
  }

  // Get the number of online users from the cache
  getOnlineMemberCount() {
    return this.users.filter((user) => user.presence === "online").size;
  }

  // Get a username from the cache
  getUsername(userId) {
    return this.users.get(userId)?.username;
  }

  // Get roles of a user from the cache
  getUserRoles(userId) {
    return this.users.get(userId)?.roles || [];
  }

  isOnline(member) {
    return ["online", "idle", "dnd"].includes(member.presence?.status);
  }

  setOnlineCount(count) {
    this.onlineCount = count;
    if (count > this.peakOnline) {
      this.peakOnline = count;
    }
    console.log(
      `Online count set to ${count}. Peak online: ${this.peakOnline}`
    );
  }

  // Get all user IDs who have a specific role
  getUserIdsWithRole(roleId) {
    return this.users.filter((user) => user.roles.includes(roleId)).keyArray();
  }

  updatePresence(userId, newPresence) {
    const user = this.users.get(userId);
    if (user) {
      if (user.presence !== "online" && newPresence === "online") {
        this.onlineCount++;
      } else if (user.presence === "online" && newPresence !== "online") {
        this.onlineCount--;
      }
      user.presence = newPresence;
      if (this.onlineCount > this.peakOnline) {
        this.peakOnline = this.onlineCount;
      }
    }
  }

  // Get peak online members
  getPeakOnline() {
    return this.peakOnline;
  }
}

module.exports = new CacheManager();
