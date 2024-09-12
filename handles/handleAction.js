const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage');

// Charger toutes les commandes dynamiquement
const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  commands.set(command.name, command);
}

module.exports = function handleAction(event, pageAccessToken) {
  const senderId = event.sender.id;
  const message = event.message;

  // Définir des actions personnalisées
  function onChat() {
    const reply = `You said: "${message.text}"`;
    sendMessage(senderId, { text: reply }, pageAccessToken);
  }

  function onStart() {
    const welcomeMessage = "Welcome to the bot! How can I assist you today?";
    sendMessage(senderId, { text: welcomeMessage }, pageAccessToken);
  }

  function onReply() {
    const replyMessage = "Thanks for your reply!";
    sendMessage(senderId, { text: replyMessage }, pageAccessToken);
  }

  // Vérifier si un message est présent
  if (!message || (!message.text && !message.attachments)) {
    console.error('Error: Message must have text or attachments.');
    return;
  }

  // Action quand un utilisateur démarre une nouvelle conversation
  if (message.is_echo) {
    console.log('Echo message, no action taken.');
    return;
  }

  // Diviser le message en parties pour extraire la commande et les arguments
  const args = message.text.split(' ');
  const commandName = args.shift().toLowerCase();

  // Vérifier si la commande est reconnue
  if (commands.has(commandName)) {
    const command = commands.get(commandName);
    try {
      command.execute(senderId, args, pageAccessToken, sendMessage);
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      sendMessage(senderId, { text: 'There was an error executing your command.' }, pageAccessToken);
    }
  } else {
    // Si l'utilisateur envoie le mot "start", démarrer la conversation
    if (message.text && message.text.toLowerCase() === 'start') {
      onStart();
    }
    // Si l'utilisateur envoie le mot "reply", simuler une réponse
    else if (message.text && message.text.toLowerCase() === 'reply') {
      onReply();
    }
    // Sinon, traiter comme une conversation classique
    else {
      onChat();
    }
  }

  // Gérer les pièces jointes
  if (message.attachments) {
    message.attachments.forEach(attachment => {
      if (attachment.type === 'image') {
        const reply = 'You sent an image!';
        sendMessage(senderId, { text: reply }, pageAccessToken);
      }
      // Gérer d'autres types de pièces jointes ici (vidéo, fichier, etc.)
    });
  }
};
