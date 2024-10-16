/* eslint-disable no-undef */
const fs = require("fs").promises;
const path = require("path");
const config = require("../config");

class XPSystem {
  constructor(client) {
    this.client = client;
    this.xpData = {};
    this.xpFile = path.join(__dirname, "..", "data", "xp.json");
    this.voiceXPInterval = config.xpSystem.voiceXPInterval; // 15 minutes in milliseconds
    this.voiceXPAmount = config.xpSystem.voiceXPAmount;
    this.messageXPAmount = config.xpSystem.messageXPAmount;
    this.maxLevel = config.xpSystem.maxLevel;
    this.xpToMaxLevel = config.xpSystem.xpToMaxLevel;
  }

  async loadXPData() {
    try {
      const data = await fs.readFile(this.xpFile, "utf8");
      if (data.trim() === "") {
        console.log("XP file is empty. Initializing with an empty object.");
        this.xpData = {};
      } else {
        this.xpData = JSON.parse(data);
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("XP file not found. Creating a new one.");
        this.xpData = {};
      } else if (error instanceof SyntaxError) {
        console.error(
          "Error parsing XP data. Initializing with an empty object:",
          error
        );
        this.xpData = {};
      } else {
        console.error("Error loading XP data:", error);
        throw error; // Re-throw unexpected errors
      }
    }
    await this.saveXPData(); // Save the data to ensure a valid JSON file
  }

  async saveXPData() {
    try {
      const jsonData = JSON.stringify(this.xpData, null, 2);
      await fs.writeFile(this.xpFile, jsonData);
    } catch (error) {
      console.error("Error saving XP data:", error);
    }
  }

  async addXP(memberId, guildId, amount) {
    console.log(
      `Adding ${amount} XP to member ${memberId} in guild ${guildId}`
    );
    if (!this.xpData[guildId]) this.xpData[guildId] = {};
    if (!this.xpData[guildId][memberId])
      this.xpData[guildId][memberId] = { xp: 0, level: 1 };

    this.xpData[guildId][memberId].xp += amount;
    const newLevel = this.calculateLevel(this.xpData[guildId][memberId].xp);

    let leveledUp = false;
    if (newLevel > this.xpData[guildId][memberId].level) {
      this.xpData[guildId][memberId].level = newLevel;
      await this.updateMemberRole(memberId, guildId, newLevel);
      leveledUp = true;
    }

    await this.saveXPData(); // Save after each XP addition
    console.log("Current XP data after addition:", this.xpData);
    return leveledUp;
  }

  calculateLevel(xp) {
    let level = 1; // Start at level 1
    let xpForNextLevel = 100; // XP required for first level
    let totalXpForLevel = 0;

    while (xp >= totalXpForLevel + xpForNextLevel && level < this.maxLevel) {
      level++;
      totalXpForLevel += xpForNextLevel;
      xpForNextLevel = Math.floor(xpForNextLevel * 1.1); // 10% increase per level
    }

    return level;
  }

  async updateMemberRole(memberId, guildId, level) {
    const guild = await this.client.guilds.fetch(guildId);
    const member = await guild.members.fetch(memberId);
    const roleName =
      level === this.maxLevel
        ? `Level ${level}`
        : `Level ${Math.floor(level / 10) * 10}`;
    let role = guild.roles.cache.find((r) => r.name === roleName);

    if (!role) {
      try {
        role = await guild.roles.create({
          name: roleName,
          reason: "XP Level Role",
        });
        console.log(`Created new role: ${roleName}`);
      } catch (error) {
        console.error(`Error creating role ${roleName}:`, error);
        return;
      }
    }

    try {
      // Remove previous level roles first
      const previousLevelRoles = member.roles.cache.filter(
        (r) => r.name.startsWith("Level") && r.name !== roleName
      );
      await member.roles.remove(previousLevelRoles);

      // Add the new role
      await member.roles.add(role);

      console.log(
        `Updated roles for member ${member.user.tag}: removed ${previousLevelRoles.size} old roles, added ${roleName}`
      );
    } catch (error) {
      console.error(`Error updating roles for member ${memberId}:`, error);
    }
  }

  async initializeNewMember(member) {
    await this.addXP(member.id, member.guild.id, 0);
    await this.updateMemberRole(member.id, member.guild.id, 1);
  }

  startVoiceXPTracker() {
    setInterval(() => {
      this.client.guilds.cache.forEach((guild) => {
        guild.voiceStates.cache.forEach((voiceState) => {
          if (voiceState.channel) {
            this.addXP(voiceState.member.id, guild.id, this.voiceXPAmount);
          }
        });
      });
    }, this.voiceXPInterval);
  }
}

module.exports = XPSystem;
