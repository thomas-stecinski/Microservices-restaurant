const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const commandeController = require('../controllers/commandeController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Commandes
 *   description: Gestion des commandes
 */

/**
 * @swagger
 * /commandes:
 *   post:
 *     summary: Créer une nouvelle commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: number
 *             example:
 *               items:
 *                 - name: Pizza
 *                   price: 12
 *                   quantity: 2
 *     responses:
 *       201:
 *         description: Commande créée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: number
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Les données de la commande sont invalides.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.post('/', authenticateToken, commandeController.createCommande);



/**
 * @swagger
 * /commandes/{id}:
 *   get:
 *     summary: Récupérer une commande par son ID
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la commande
 *     responses:
 *       200:
 *         description: Commande récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Commande non trouvée.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.get('/:id', authenticateToken, commandeController.getCommande);

/**
 * @swagger
 * /commandes:
 *   get:
 *     summary: Lister toutes les commandes du client authentifié
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des commandes récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Erreur interne du serveur.
 */
router.get('/', authenticateToken, commandeController.listCommandes);


/**
 * @swagger
 * /commandes/{id}/status:
 *   put:
 *     summary: Mettre à jour le statut d'une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la commande
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [En attente, Livrée, Annulée]
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Statut invalide.
 *       404:
 *         description: Commande non trouvée.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.put('/:id/status', authenticateToken, commandeController.updateCommandeStatus);


/**
 * @swagger
 * /commandes/{id}:
 *   delete:
 *     summary: Annuler une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la commande
 *     responses:
 *       200:
 *         description: Commande annulée avec succès.
 *       404:
 *         description: Commande non trouvée.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.delete('/:id', authenticateToken, commandeController.cancelCommande);

module.exports = router;
