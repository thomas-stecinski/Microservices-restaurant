const express = require('express');
const bodyParser = require('body-parser');
const router = require('./src/routes/router'); 

const app = express();
const port = 3002;

app.use(bodyParser.json());
app.use(router);

app.get('/health', (req, res) => {
  res.status(200).send('Client Service is running!');
});

app.listen(port, () => {
  console.log(`Client Service is running on http://localhost:${port}`);
});
