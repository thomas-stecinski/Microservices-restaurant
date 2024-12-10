const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
const { connectRabbitMQ } = require('../utils/rabbitmq');

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

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
 *         description: Profil utilisateur récupéré.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nom:
 *                   type: string
 *                 prenom:
 *                   type: string
 *                 role:
 *                   type: string
 */
router.get('/profile', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.query('SELECT nom, prenom, role FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) return res.status(500).send(err);

        res.send(results[0]);
    });
});

/**
 * @swagger
 * /user/preferences:
 *   put:
 *     summary: Mettre à jour les préférences alimentaires
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferences:
 *                 type: string
 *             example:
 *               preferences: "Sans gluten, végétarien"
 *     responses:
 *       200:
 *         description: Préférences mises à jour avec succès.
 */
router.put('/preferences', authenticateToken, (req, res) => {
    const { preferences } = req.body;
    const userId = req.user.id;

    db.query('UPDATE users SET preferences = ? WHERE id = ?', [preferences, userId], (err) => {
        if (err) return res.status(500).send(err);

        res.send({ message: 'Préférences mises à jour.' });
    });
});

module.exports = router;
