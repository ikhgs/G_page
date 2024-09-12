const axios = require('axios');

module.exports = {
  config: {
    name: "gem29",
    author: "cliff",
    version: "1.0.0",
    countDown: 5,
    role: 0,
    category: "AI",
    shortDescription: {
      en: "{p}gem29"
    }
  },
  onStart: async function ({ api, event, args }) {
    try {
      if (!args[0]) {
        return api.sendMessage("Please provide a prompt for Gem29.", event.threadID);
      }

      const prompt = encodeURIComponent(args.join(" "));
      const apiUrl = `https://gem2-9b-it-njiv.vercel.app/api?ask=${prompt}`;

      const response = await axios.get(apiUrl);

      if (response.data && response.data.response) {
        api.sendMessage(response.data.response, event.threadID);
      } else {
        api.sendMessage("Unable to get a response from Gem29.", event.threadID);
      }
    } catch (error) {
      console.error('Error making Gem29 API request:', error.message);
      api.sendMessage("An error occurred while processing your request.", event.threadID);
    }
  }
};
