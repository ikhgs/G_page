const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage');

// Charger toutes les commandes dynamiquement
const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  commands.set(command.config.name, command);
}

module.exports = async function handleAction(event, pageAccessToken) {
  const senderId = event.sender.id;
  const message = event.message;

  // Définir des actions personnalisées
  async function onChat() {
    const reply = `You said: "${message.text}"`;
    await sendMessage(senderId, { text: reply }, pageAccessToken);
  }

  async function onStart() {
    const welcomeMessage = "Welcome to the bot! How can I assist you today?";
    await sendMessage(senderId, { text: welcomeMessage }, pageAccessToken);
  }

  async function onReply() {
    const replyMessage = "Thanks for your reply!";
    await sendMessage(senderId, { text: replyMessage }, pageAccessToken);
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
      // Remplacer 'execute' par 'onStart'
      if (command.onStart) {
        await command.onStart({
          api: {
            sendMessage: (text, threadID) => sendMessage(senderId, { text }, pageAccessToken)
          },
          event: { threadID: senderId },
          args
        });
      } else {
        await sendMessage(senderId, { text: 'Command not supported.' }, pageAccessToken);
      }
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      await sendMessage(senderId, { text: 'There was an error executing your command.' }, pageAccessToken);
    }
  } else {
    // Si l'utilisateur envoie le mot "start", démarrer la conversation
    if (message.text && message.text.toLowerCase() === 'start') {
      await onStart();
    }
    // Si l'utilisateur envoie le mot "reply", simuler une réponse
    else if (message.text && message.text.toLowerCase() === 'reply') {
      await onReply();
    }
    // Sinon, traiter comme une conversation classique
    else {
      await onChat();
    }
  }

  // Gérer les pièces jointes
  if (message.attachments) {
    for (const attachment of message.attachments) {
      if (attachment.type === 'image') {
        const reply = 'You sent an image!';
        await sendMessage(senderId, { text: reply }, pageAccessToken);
      }
      // Gérer d'autres types de pièces jointes ici (vidéo, fichier, etc.)
    }
  }
};
