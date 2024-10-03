// events/guildMemberUpdate.js
const cacheManager = require("../utils/cacheManager.js");

module.exports = (oldMember, newMember) => {
  cacheManager.cacheMember(newMember);
};
