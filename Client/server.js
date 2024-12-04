const express = require('express');
const bodyParser = require('body-parser');
const router = require('./src/routes/router');
const { connectRabbitMQ } = require('./src/utils/rabbitmq'); 
require('./src/events/consumeCommandeEvents'); 

const app = express();
const port = 3002;

app.use(bodyParser.json());
app.use(router);

app.get('/health', (req, res) => {
  res.status(200).send('Client Service is running!');
});

connectRabbitMQ().then(() => {
  console.log('RabbitMQ connecté pour le microservice Client');
});

app.listen(port, () => {
  console.log(`Client Service is running on http://localhost:${port}`);
});
