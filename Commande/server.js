const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectRabbitMQ } = require('./src/utils/rabbitmq');
const commandeRoutes = require('./src/routes/commandeRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const { consumeMessage } = require('./src/utils/rabbitmq');

// Charger les variables d'environnement
dotenv.config();

const app = express();
app.use(express.json());

// Connexion à MongoDB
mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => console.log("MongoDB connecté"))
    .catch((err) => console.error("Erreur de connexion à MongoDB :", err));

connectRabbitMQ()
    .then(() => {
      console.log('RabbitMQ connecté')

      consumeMessage('delivery_status_updated', (event) => {
        console.log('Événement delivery_status_updated reçu:', event);
        console.log(`Statut de la commande ${event.id} mis à jour: ${event.status}`);
      });
    })
    .catch((error) => {
      console.error('Erreur de connexion à RabbitMQ :', error);
    });


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/commandes', commandeRoutes);


// Démarrer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Commande Service is running on http://localhost:${PORT}`));
