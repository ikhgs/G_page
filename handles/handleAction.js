const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage'); // Assurez-vous que ce fichier existe

// Charger toutes les commandes dynamiquement
const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

// Ajouter chaque commande dans la map des commandes
for (const file of commandFiles) {
  const command = require(path.join(__dirname, '../commands', file));
  commands.set(command.config.name, command);
}

// Fonction pour exécuter des commandes
async function handleAction(event, api) {
  const { body } = event.message;
  const args = body.trim().split(/\s+/); // Découpe le message en mots
  const commandName = args[0].toLowerCase(); // Le premier mot est le nom de la commande

  // Vérifie si une commande existe avec ce nom
  const command = commands.get(commandName);

  // Si une commande est trouvée et dispose de la fonction onStart, l'exécuter
  if (command && command.onStart) {
    try {
      await command.onStart({ api, event, args: args.slice(1) }); // Passe les arguments à partir du deuxième mot
    } catch (error) {
      console.error(`Erreur lors de l'exécution de la commande ${commandName}:`, error);
      api.sendMessage(`Une erreur est survenue lors de l'exécution de la commande ${commandName}.`, event.threadID);
    }
  }

  // Si aucune commande explicite, exécuter la fonction onchat si elle existe
  else {
    for (const [name, cmd] of commands) {
      if (cmd.onchat) {
        try {
          await cmd.onchat({ api, event });
        } catch (error) {
          console.error(`Erreur lors de l'exécution de onchat pour la commande ${name}:`, error);
        }
      }
    }
  }
}

module.exports = handleAction;
