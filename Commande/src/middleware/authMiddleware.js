const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

exports.authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extraire le token
    if (!token) {
        console.error('Token manquant.');
        return res.status(401).json({ message: 'Token manquant.' });
    }

    // Vérification avec la clé JWT
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET non défini dans Commande.');
        return res.status(500).json({ message: 'Erreur serveur : clé JWT manquante.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Erreur de validation JWT :', err.message);
            return res.status(403).json({ message: 'Token invalide.' });
        }

        req.user = user; // Attachez l'utilisateur validé à la requête
        next();
    });
};
