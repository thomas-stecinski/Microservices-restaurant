/**
 * @swagger
 * tags:
 *   - name: Delivery
 *     description: Routes liées aux livraisons
 */

const express = require("express");
const {
  createDelivery,
  updateDelivery,
  getDeliveryDetails,
  deleteDelivery,
} = require("../controllers/deliveryController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /api/delivery/createDelivery:
 *   post:
 *     tags:
 *       - Delivery
 *     summary: Créer une nouvelle livraison
 *     description: Si le prix n'est pas fourni, il sera récupéré depuis le service Commandes.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idCommande:
 *                 type: string
 *                 example: "63d72c1f9f1b0c24dc6e4a70"
 *               adresse:
 *                 type: string
 *                 example: "123 Rue Exemple"
 *               ville:
 *                 type: string
 *                 example: "Paris"
 *               prix:
 *                 type: number
 *                 description: Optionnel si récupéré depuis le service Commandes.
 *                 example: 20.5
 *               dateLivraison:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *     responses:
 *       201:
 *         description: Livraison créée avec succès
 *       400:
 *         description: Requête incorrecte
 *       500:
 *         description: Erreur interne
 */
router.post("/createDelivery", authenticateToken, createDelivery);

/**
 * @swagger
 * /api/delivery/updateDelivery/{id}:
 *   put:
 *     tags:
 *       - Delivery
 *     summary: Mettre à jour une livraison
 *     description: Mise à jour du statut d'une livraison existante.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["En attente", "En cours", "Livrée", "Annulée"]
 *                 example: "Livrée"
 *     responses:
 *       200:
 *         description: Livraison mise à jour avec succès
 *       400:
 *         description: Requête incorrecte
 *       404:
 *         description: Livraison non trouvée
 *       500:
 *         description: Erreur interne
 */
router.put("/updateDelivery/:id", authenticateToken, updateDelivery);

/**
 * @swagger
 * /api/delivery/detailsDelivery/{id}:
 *   get:
 *     tags:
 *       - Delivery
 *     summary: Obtenir les détails d'une livraison par ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la livraison
 *       404:
 *         description: Livraison non trouvée
 *       500:
 *         description: Erreur interne
 */
router.get("/detailsDelivery/:id", authenticateToken, getDeliveryDetails);

/**
 * @swagger
 * /api/delivery/deleteDelivery/{id}:
 *   delete:
 *     tags:
 *       - Delivery
 *     summary: Supprimer une livraison par ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Livraison supprimée avec succès
 *       404:
 *         description: Livraison non trouvée
 *       500:
 *         description: Erreur interne
 */
router.delete("/deleteDelivery/:id", authenticateToken, deleteDelivery);

module.exports = router;
