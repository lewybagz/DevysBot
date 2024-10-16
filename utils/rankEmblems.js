const RANK_EMBLEMS = {
  Unranked: "https://ibb.co/THk4gMX",
  "Bronze I": "https://ibb.co/vL0Dp9P",
  "Bronze II": "https://ibb.co/2yYzHxx",
  "Bronze III": "https://ibb.co/3zgfYsP",
  "Silver I": "https://ibb.co/p1BZLg9",
  "Silver II": "https://ibb.co/9vvcZmp",
  "Silver III": "https://ibb.co/tJ9gy06",
  "Gold I": "https://ibb.co/TcqLDwd",
  "Gold II": "https://ibb.co/gZTSmty",
  "Gold III": "https://ibb.co/PZM0mwr",
  "Platinum I": "https://ibb.co/Zgg4BDR",
  "Platinum II": "https://ibb.co/1Gs5jxJ",
  "Platinum III": "https://ibb.co/sbc7myC",
  "Diamond I": "https://ibb.co/JyjSKHM",
  "Diamond II": "https://ibb.co/Lp3dq0k",
  "Diamond III": "https://ibb.co/txZqZV7",
  "Champion I": "https://ibb.co/PwBM7Fr",
  "Champion II": "https://ibb.co/hLwYBNM",
  "Champion III": "https://ibb.co/T1jzppL",
  "Grand Champion I": "https://ibb.co/HBfpyTN",
  "Grand Champion II": "https://ibb.co/WD8wPBX",
  "Grand Champion III": "https://ibb.co/XDbbnQ3",
  "Supersonic Legend": "https://ibb.co/m4gjyJD",
};

function getRankEmblemUrl(rank) {
  return RANK_EMBLEMS[rank] || RANK_EMBLEMS["Unranked"];
}

module.exports = { getRankEmblemUrl };
