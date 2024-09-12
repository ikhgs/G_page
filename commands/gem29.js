const axios = require('axios');

module.exports = {
  name: "gem29", // Utilise le format attendu par handleAction.js
  description: "Commande pour interagir avec l'API gem29",
  
  // La méthode `execute` utilisée dans handleAction.js
  execute: async function (senderId, args, pageAccessToken, sendMessage) {
    try {
      // Vérifie si un prompt est fourni
      if (!args[0]) {
        return await sendMessage(senderId, { text: "Please provide a prompt for Llama." }, pageAccessToken);
      }

      const prompt = encodeURIComponent(args.join(" "));
      const apiUrl = `https://gem2-9b-it-njiv.vercel.app/api?ask=${prompt}`;

      // Appel API vers gem29
      const response = await axios.get(apiUrl);

      if (response.data && response.data.response) {
        // Envoie la réponse de l'API à l'utilisateur
        await sendMessage(senderId, { text: response.data.response }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: "Unable to get a response from Llama3." }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error making Llama API request:', error.message);
      await sendMessage(senderId, { text: "An error occurred while processing your request." }, pageAccessToken);
    }
  }
};
