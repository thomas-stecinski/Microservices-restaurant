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

        // Connexion à la base de données
        const connection = await db.connectDatabase();

        // Insertion de l'utilisateur dans la table
        const sql = 'INSERT INTO users (nom, prenom, password, role) VALUES (?, ?, ?, ?)';
        const [result] = await connection.execute(sql, [nom, prenom, hashedPassword, role]);

        // Publier l'événement via RabbitMQ
        const clientEvent = { nom, prenom, role };
        await publishMessage('client_registered', clientEvent);

        console.log('Utilisateur enregistré et événement publié avec succès.');
        res.status(201).json({
            message: 'Utilisateur enregistré avec succès.',
            user: { id: result.insertId, nom, prenom, role },
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
router.post('/login', async (req, res) => {
    const { nom, password } = req.body;

    if (!nom || !password) {
        console.log("Requête invalide : nom ou password manquant.");
        return res.status(400).send({ message: 'Nom et mot de passe requis.' });
    }

    console.log(`Tentative de connexion pour l'utilisateur : ${nom}`);

    try {
        const [results] = await db.query('SELECT * FROM users WHERE nom = ?', [nom]);

        if (results.length === 0) {
            console.log("Utilisateur non trouvé.");
            return res.status(404).send({ message: 'Utilisateur non trouvé.' });
        }

        const user = results[0];
        console.log("Utilisateur trouvé :", user);

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            console.log("Mot de passe incorrect.");
            return res.status(401).send({ message: 'Mot de passe incorrect.' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log("Token JWT généré :", token);

        const clientEvent = { clientId: user.id, role: user.role, token };
        await publishMessage('client_authenticated', clientEvent);

        console.log("Événement publié avec succès via RabbitMQ.");
        res.send({ message: 'Connexion réussie.', token });
    } catch (err) {
        console.error('Erreur lors de la connexion:', err);
        res.status(500).json({ message: 'Erreur interne.' });
    }
});


module.exports = router;