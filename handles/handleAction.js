const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage'); // Assurez-vous que le chemin est correct

// Charger toutes les commandes dynamiquement
const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

commandFiles.forEach(file => {
  const command = require(path.join(__dirname, '../commands', file));
  if (command.onchat) {
    commands.set(command.config.name, command);
  }
});

async function handleAction(api, event) {
  if (!event.message || !event.message.body) {
    console.log('Message or body is missing');
    return;
  }

  console.log('Received message:', event.message.body); // Debugging log

  const commandName = event.message.body.trim().split(/\s+/)[0];
  console.log('Command name extracted:', commandName); // Debugging log

  const command = commands.get(commandName);

  if (command && command.onchat) {
    console.log('Executing onchat for command:', commandName); // Debugging log
    await command.onchat({ api, event });
  } else {
    await sendMessage(api, "Commande non trouvée : " + commandName, event.threadID); // Utilisation de sendMessage
  }
}

module.exports = { handleAction };
