const axios = require('axios');

module.exports = {
  config: {
    name: "gem29",
    author: "cliff", // API by hazey
    version: "1.0.0",
    countDown: 5,
    role: 0,
    category: "Ai",
    shortDescription: {
      en: "{p}mixtral"
    }
  },
  
  // La fonction onStart est vide, donc aucune action n'est déclenchée quand la commande est explicitement appelée
  onStart: async function ({ api, event, args }) {
    // Aucune logique ici, donc cette fonction ne fait rien
  },
  
  // La fonction onchat répond automatiquement à chaque message de l'utilisateur
  onchat: async function ({ api, event }) {
    try {
      // Récupérer le message de l'utilisateur et encoder pour l'API
      const prompt = encodeURIComponent(event.message.body);
      const apiUrl = `https://gem2-9b-it-njiv.vercel.app/api?ask=${prompt}`;
      
      // Envoyer la requête à l'API
      const response = await axios.get(apiUrl);
      
      // Envoyer la réponse au thread de l'utilisateur
      if (response.data && response.data.response) {
        api.sendMessage(response.data.response, event.threadID);
      } else {
        api.sendMessage("Unable to get a response from the API.", event.threadID);
      }
    } catch (error) {
      console.error('Error making API request:', error.message);
      api.sendMessage("An error occurred while processing your request.", event.threadID);
    }
  }
};
