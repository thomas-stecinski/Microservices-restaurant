const express = require('express');
const bodyParser = require('body-parser');
const router = require('./src/routes/router');
const { connectRabbitMQ, consumeMessage } = require('./src/utils/rabbitmq');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(router);

connectRabbitMQ()
    .then(() => {
      console.log('RabbitMQ connecté');

      consumeMessage('delivery_status_updated', (event) => {
        console.log('Événement delivery_status_updated reçu:', event);
        console.log(`Statut de la commande ${event.id} mis à jour: ${event.status}`);
      });
    })
    .catch((error) => {
      console.error('Erreur de connexion à RabbitMQ :', error);
    });

app.get('/health', (req, res) => {
  res.status(200).send('Commande Service is running!');
});

app.listen(port, () => {
  console.log(`Commande Service is running on http://localhost:${port}`);
});

