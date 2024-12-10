const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const { connectRabbitMQ } = require('./utils/rabbitmq'); // Importer RabbitMQ

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Initialisation du serveur avec RabbitMQ
const startServer = async () => {
    try {
        // Connexion à RabbitMQ avec logique de reconnexion
        console.log('Connexion à RabbitMQ en cours...');
        await connectRabbitMQ();
        console.log('RabbitMQ connecté avec succès');

        // Démarrer le serveur Express
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'application :', error.message);
        process.exit(1); // Arrêter l'application en cas d'erreur critique
    }
};

startServer();
