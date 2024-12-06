const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Utilisateur',
            version: '1.0.0',
            description: 'Documentation de l\'API pour la gestion des utilisateurs.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Serveur local',
            },
        ],
    },
    apis: ['./routes/*.js'], // Indique où Swagger doit chercher les commentaires
};

const specs = swaggerJSDoc(options);
module.exports = specs;
