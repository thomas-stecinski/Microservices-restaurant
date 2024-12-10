const mysql = require('mysql2/promise');

let connection;

const connectDatabase = async (retries = 5, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Tentative de connexion à MySQL (${i + 1}/${retries})...`);
            connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'restaurant_client',
            });
            console.log('Connecté à MySQL');
            return connection; // Retourner la connexion si elle réussit
        } catch (error) {
            console.error(`Erreur de connexion à MySQL : ${error.message}`);
            if (i < retries - 1) {
                console.log(`Nouvelle tentative dans ${delay / 1000} secondes...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                console.error('Impossible de se connecter à MySQL après plusieurs tentatives');
                throw error;
            }
        }
    }
};

module.exports = { connectDatabase };
