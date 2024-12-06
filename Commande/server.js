const express = require('express');
const bodyParser = require('body-parser');
const router = require('./src/routes/router');
const { connectRabbitMQ } = require('./src/utils/rabbitmq');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(router);

// Connecter RabbitMQ
connectRabbitMQ().then(() => {
  console.log('RabbitMQ connecté');
});

app.get('/health', (req, res) => {
  res.status(200).send('Commande Service is running!');
});

app.listen(port, () => {
  console.log(`Commande Service is running on http://localhost:${port}`);
});
