// cacheManager.js
const { Collection } = require("discord.js");

class CacheManager {
  constructor() {
    this.users = new Collection();
    this.roles = new Collection(); // New collection for roles
    this.peakOnline = 0;
  }

  async cacheGuildRoles(guild) {
    try {
      const roles = await guild.roles.fetch(); // Fetch and cache all roles
      roles.forEach((role) => {
        this.roles.set(role.id, role);
      });
      console.log(`Cached ${this.roles.size} roles from guild ${guild.name}.`);
    } catch (error) {
      console.error("Error caching guild roles:", error);
    }
  }

  // Get all roles (for dropdown menu)
  getAllRoles() {
    return this.roles.map((role) => role); // Directly use map
  }

  // Cache all members when the bot joins the guild
  async cacheGuildMembers(guild) {
    try {
      const members = await guild.members.fetch(); // Fetch all members
      members.forEach((member) => {
        this.cacheMember(member);
      });
      console.log(
        `Cached ${this.users.size} members from guild ${guild.name}.`
      );
    } catch (error) {
      console.error("Error caching guild members:", error);
    }
  }

  // Add a new member to the cache
  cacheMember(member) {
    const roles = member.roles.cache.map((role) => role.id); // Simplified role mapping
    const presence = member.presence?.status || "offline"; // Cache presence
    this.users.set(member.id, {
      username: member.user.username,
      roles: roles,
      presence: presence, // Store the presence here
    });

    console.log(
      `Cached user ${member.user.username} with roles [${roles.join(
        ", "
      )}] and presence ${presence}.`
    );
  }

  // Get the number of online users from the cache
  getOnlineMemberCount() {
    return this.users.filter((user) => user.presence === "online").size;
  }

  // Get a username from the cache
  getUsername(userId) {
    const userData = this.users.get(userId);
    return userData ? userData.username : null;
  }

  // Get roles of a user from the cache
  getUserRoles(userId) {
    const userData = this.users.get(userId);
    return userData ? userData.roles : [];
  }

  // Get all user IDs who have a specific role
  getUserIdsWithRole(roleId) {
    const usersWithRole = this.users.filter((userData) =>
      userData.roles.includes(roleId)
    );

    // If no users found with the role, return an empty array
    if (usersWithRole.size === 0) {
      console.log(`No users found with role ID: ${roleId}`);
      return [];
    }

    // Otherwise, return the user IDs of those with the role
    return usersWithRole.keyArray();
  }

  // Function to update peak online members count
  updatePeakOnline() {
    const onlineCount = this.getOnlineMemberCount();
    if (onlineCount > this.peakOnline) {
      this.peakOnline = onlineCount;
    }
  }

  // Get peak online members
  getPeakOnline() {
    return this.peakOnline;
  }
}

module.exports = new CacheManager();
