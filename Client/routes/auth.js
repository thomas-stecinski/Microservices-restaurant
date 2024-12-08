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
const router = express.Router();
const { connectRabbitMQ } = require('../utils/rabbitmq');

const saltRounds = 10;

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
 *       400:
 *         description: Données manquantes ou incorrectes.
 */
router.post('/register', async (req, res) => {
    const { nom, prenom, password, role } = req.body;

    // Validation des champs requis
    if (!nom || !prenom || !password || !role) {
        return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
    }

    try {
        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Enregistrer l'utilisateur dans la base de données
        const user = { nom, prenom, password: hashedPassword, role };
        await db('users').insert(user);

        // Publier l'événement client_registered
        const clientEvent = { nom, prenom, role };
        await publishMessage('client_registered', clientEvent);
        console.log('Événement client_registered publié:', clientEvent);

        res.status(201).json({ message: 'Utilisateur enregistré avec succès.', user: { nom, prenom, role } });
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
 *       401:
 *         description: Mot de passe incorrect.
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
        res.send({ message: 'Connexion réussie.', token });
    });
});

module.exports = router;
