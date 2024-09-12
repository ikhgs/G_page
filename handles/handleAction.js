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

  if (!message || (!message.text && !message.attachments)) {
    console.error('Error: Message must have text or attachments.');
    return;
  }

  if (message.is_echo) {
    console.log('Echo message, no action taken.');
    return;
  }

  // Diviser le texte du message en arguments
  const args = message.text.split(' ');

  // Chercher et exécuter automatiquement la fonction `onChat` de chaque commande qui la contient
  for (const [commandName, command] of commands) {
    if (typeof command.onChat === 'function') {
      try {
        await command.onChat({ senderId, args, pageAccessToken, sendMessage });
      } catch (error) {
        console.error(`Error executing onChat for command ${commandName}:`, error);
      }
    }
  }
};
