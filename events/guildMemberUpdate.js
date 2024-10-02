// events/guildMemberUpdate.js
const cacheManager = require("../cacheManager.js");

module.exports = (oldMember, newMember) => {
  cacheManager.cacheMember(newMember);
};
