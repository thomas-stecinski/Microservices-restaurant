/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - nom
 *         - prenom
 *         - password
 *         - role
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom de l'utilisateur
 *         prenom:
 *           type: string
 *           description: Prénom de l'utilisateur
 *         password:
 *           type: string
 *           description: Mot de passe de l'utilisateur
 *         role:
 *           type: string
 *           enum: [admin, user]
 *           description: Rôle de l'utilisateur
 *       example:
 *         nom: Dupont
 *         prenom: Jean
 *         password: motdepasse123
 *         role: user
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { publishMessage } = require('../utils/rabbitmq');
const router = express.Router();

const saltRounds = 10;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gestion des utilisateurs et authentification
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription d'un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Utilisateur enregistré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message de succès.
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Données manquantes ou incorrectes.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.post('/register', async (req, res) => {
    const { nom, prenom, password, role } = req.body;

    if (!nom || !prenom || !password || !role) {
        return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // SQL query to insert the user into the database
        const sql = 'INSERT INTO users (nom, prenom, password, role) VALUES (?, ?, ?, ?)';
        const values = [nom, prenom, hashedPassword, role];

        db.query(sql, values, (err, results) => {
            if (err) {
                console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', err);
                return res.status(500).json({ error: 'Erreur interne du serveur.' });
            }

            // Publier l'événement client_registered
            const clientEvent = { nom, prenom, role };
            publishMessage('client_registered', clientEvent)
                .then(() => {
                    console.log('Événement client_registered publié:', clientEvent);
                    res.status(201).json({ message: 'Utilisateur enregistré avec succès.', user: { nom, prenom, role } });
                })
                .catch((publishError) => {
                    console.error('Erreur lors de la publication de l\'événement:', publishError);
                    res.status(500).json({ error: 'Erreur interne lors de la publication de l\'événement.' });
                });
        });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', error);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               nom: Dupont
 *               password: motdepasse123
 *     responses:
 *       200:
 *         description: Connexion réussie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message de succès.
 *                 token:
 *                   type: string
 *                   description: JWT pour l'utilisateur connecté.
 *       401:
 *         description: Mot de passe incorrect.
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Erreur interne.
 */
router.post('/login', (req, res) => {
    const { nom, password } = req.body;

    if (!nom || !password) {
        return res.status(400).send({ message: 'Nom et mot de passe requis.' });
    }

    db.query('SELECT * FROM users WHERE nom = ?', [nom], async (err, results) => {
        if (err) return res.status(500).send(err);

        if (results.length === 0) {
            return res.status(404).send({ message: 'Utilisateur non trouvé.' });
        }

        const user = results[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).send({ message: 'Mot de passe incorrect.' });
        }


        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const clientEvent = { clientId: user.id, role: user.role, token };
        await publishMessage('client_authenticated', clientEvent)

    .then(() => {
                res.send({ message: 'Connexion réussie.', token });
            })
            .catch((err) => {
                console.error('Erreur lors de la publication RabbitMQ:', err);
                res.status(500).json({ message: 'Erreur interne.' });
            });
    });
});

module.exports = router;
