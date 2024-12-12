const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
const { connectRabbitMQ } = require('../utils/rabbitmq');

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    console.log('Headers reçus :', req.headers);

    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        console.log("Erreur d'authentification : Token manquant.");
        return res.status(401).send({ message: 'Token manquant ou invalide.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log("Erreur d'authentification : Token invalide.", err);
            return res.status(403).send({ message: 'Accès refusé.' });
        }
        req.user = user;
        console.log("Authentification réussie pour l'utilisateur :", user);
        next();
    });
};


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom de l'utilisateur
 *         prenom:
 *           type: string
 *           description: Prénom de l'utilisateur
 *         role:
 *           type: string
 *           description: Rôle de l'utilisateur
 *       example:
 *         nom: Dupont
 *         prenom: Jean
 *         role: user
 *     UpdatePreferencesRequest:
 *       type: object
 *       properties:
 *         preferences:
 *           type: string
 *           description: Préférences alimentaires de l'utilisateur
 *       example:
 *         preferences: "Sans gluten, végétarien"
 */

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Non autorisé, jeton manquant ou invalide.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.get('/profile', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const [results] = await db.query('SELECT nom, prenom, role FROM users WHERE id = ?', [userId]);

        if (results.length === 0) {
            console.log(`Utilisateur avec ID ${userId} non trouvé.`);
            return res.status(404).send({ message: 'Utilisateur non trouvé.' });
        }

        console.log("Profil utilisateur récupéré :", results[0]);
        res.status(200).send(results[0]);
    } catch (err) {
        console.error('Erreur lors de la récupération du profil :', err);
        res.status(500).send({ message: 'Erreur interne du serveur.' });
    }
});


/**
 * @swagger
 * /user/preferences:
 *   put:
 *     summary: Mettre à jour les préférences alimentaires de l'utilisateur
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePreferencesRequest'
 *     responses:
 *       200:
 *         description: Préférences mises à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message de succès
 *               example:
 *                 message: "Préférences mises à jour."
 *       400:
 *         description: Données manquantes ou invalides.
 *       401:
 *         description: Non autorisé, jeton manquant ou invalide.
 *       500:
 *         description: Erreur interne.
 */
router.put('/preferences', authenticateToken, async (req, res) => {
    const { preferences } = req.body;
    const userId = req.user.id;

    if (!preferences) {
        console.log("Préférences manquantes dans la requête.");
        return res.status(400).send({ message: 'Préférences manquantes.' });
    }

    try {
        const [result] = await db.query('UPDATE users SET preferences = ? WHERE id = ?', [preferences, userId]);

        if (result.affectedRows === 0) {
            console.log(`Aucune mise à jour effectuée pour l'utilisateur avec ID ${userId}.`);
            return res.status(404).send({ message: 'Utilisateur non trouvé.' });
        }

        console.log(`Préférences mises à jour pour l'utilisateur avec ID ${userId} : ${preferences}`);
        res.status(200).send({ message: 'Préférences mises à jour.' });
    } catch (err) {
        console.error('Erreur lors de la mise à jour des préférences :', err);
        res.status(500).send({ message: 'Erreur interne du serveur.' });
    }
});

module.exports = router;
