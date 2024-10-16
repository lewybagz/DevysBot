const axios = require("axios");
const config = require("../config");

// Helper function to make API requests

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function makeApiRequest(endpoint, params = {}, retries = 3) {
  const url = `https://${config.RAPID_API_HOST}${endpoint}`;
  console.log("Requesting URL:", url);

  const options = {
    method: "GET",
    url: url,
    params: params,
    headers: {
      "X-RapidAPI-Key": config.RAPID_API_KEY,
      "X-RapidAPI-Host": config.RAPID_API_HOST,
      "x-rapidapi-ua": "RapidAPI-Playground",
    },
  };

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      if (
        error.code === "ECONNABORTED" ||
        (error.response && error.response.status >= 500)
      ) {
        console.log(`API request failed, retrying (${i + 1}/${retries})...`);
        await delay(1000 * (i + 1)); // Exponential backoff
      } else {
        throw error; // If it's not a timeout or server error, throw immediately
      }
    }
  }

  throw new Error("API request failed after multiple retries");
}

async function fetchPlayerRank(username) {
  return await makeApiRequest(`/ranks/${encodeURIComponent(username)}`);
}

module.exports = { fetchPlayerRank };
