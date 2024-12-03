const express = require('express');
const bodyParser = require('body-parser');
const router = require('./src/routes/router');

const app = express();
const port = 3001;

app.use(bodyParser.json());

app.use(router);

app.get('/health', (req, res) => {
  res.status(200).send('Commande Service is running!');
});

app.listen(port, () => {
  console.log(`Commande Service is running on http://localhost:${port}`);
});
