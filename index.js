const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { handlePostback } = require('./handles/handlePostback');
const { sendMessage } = require('./handles/sendMessage');
const { handleAction } = require('./handles/handleAction');  // Assurez-vous que ceci est correct

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = 'pagebot';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || fs.readFileSync('token.txt', 'utf8').trim();

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400); // Bad request si des paramètres obligatoires sont manquants
  }
});

app.post('/webhook', (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'page') {
      body.entry.forEach(entry => {
        entry.messaging.forEach(event => {
          if (event.message) {
            // Appeler handleAction.js pour traiter les messages
            handleAction(event, PAGE_ACCESS_TOKEN);
          } else if (event.postback) {
            handlePostback(event, PAGE_ACCESS_TOKEN);
          }
        });
      });

      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404); // Not found pour les objets non supportés
    }
  } catch (error) {
    console.error('Error processing webhook event:', error);
    res.sendStatus(500); // Internal server error pour les problèmes inattendus
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
