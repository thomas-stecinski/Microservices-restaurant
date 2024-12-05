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

    if (!nom || !prenom || !password || !role) {
        return res.status(400).send({ message: 'Tous les champs sont requis.' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    db.query(
        'INSERT INTO users (nom, prenom, password, role) VALUES (?, ?, ?, ?)',
        [nom, prenom, hashedPassword, role],
        (err) => {
            if (err) return res.status(500).send(err);
            res.status(201).send({ message: 'Utilisateur enregistré.' });
        }
    );
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
