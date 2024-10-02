const cacheManager = require("../cacheManager.js");

module.exports = (member) => {
  cacheManager.cacheMember(member);
};
