const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage');

// Charger toutes les commandes dynamiquement
const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  commands.set(command.config.name.toLowerCase(), command);
}

async function handleAction(event, PAGE_ACCESS_TOKEN) {
  try {
    if (!event.message) {
      console.error('Pas de message dans l\'événement');
      return;
    }

    const body = event.message.text;

    if (typeof body !== 'string') {
      console.log("Le message reçu n'est pas un texte valide.");
      return;
    }

    const args = body.trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    const command = commands.get(commandName);

    if (command) {
      if (command.onStart) {
        await command.onStart({ api: { sendMessage }, event, args });
      } else if (command.onChat) {
        await command.onChat({ api: { sendMessage }, event });
      } else {
        console.log(`La commande ${commandName} n'a pas de fonction onStart ni onChat.`);
      }
    } else {
      console.log(`Commande non trouvée : ${commandName}`);
    }
  } catch (error) {
    console.error('Erreur dans handleAction:', error);
  }
}

module.exports = { handleAction };
