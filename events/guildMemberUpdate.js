// events/guildMemberUpdate.js
const cacheManager = require("../utils/cacheManager.js");

module.exports = (oldMember, newMember) => {
  cacheManager.cacheMember(newMember);
  console.log(
    `Member ${newMember.user.tag} was updated in ${newMember.guild.name}`
  );
};
