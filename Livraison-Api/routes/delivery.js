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
  detailsDelivery,
  deleteDelivery,
} = require("../controllers/deliveryController");
const { authenticateToken} = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /api/delivery/createDelivery:
 *     post:
 *       tags:
 *         - Delivery
 *       summary: Create a new delivery
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idComande:
 *                   type: string
 *                   example: "63d72c1f9f1b0c24dc6e4a70"
 *                 idClient:
 *                   type: string
 *                   example: "63d72c1f9f1b0c24dc6e4a71"
 *                 adresse:
 *                   type: string
 *                   example: "123 Rue Exemple"
 *                 ville:
 *                   type: string
 *                   example: "Paris"
 *                 prix:
 *                   type: number
 *                   example: 20.5
 *                 dateLivraison:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-01"
 *       responses:
 *         201:
 *           description: Delivery created successfully
 */
router.post("/createDelivery", authenticateToken, createDelivery);

/**
 * @swagger
 * /api/delivery/updateDelivery/{id}:
 *   put:
 *     tags:
 *       - Delivery
 *     summary: Update an existing delivery
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
 *         description: Delivery updated successfully
 */
router.put("/updateDelivery/:id", authenticateToken, updateDelivery);

/**
 * @swagger
 * /api/delivery/detailsDelivery/{id}:
 *   get:
 *     tags:
 *       - Delivery
 *     summary: Get delivery details by ID
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
 *         description: Delivery details
 */
router.get("/detailsDelivery/:id", authenticateToken, detailsDelivery);

/**
 * @swagger
 * /api/delivery/deleteDelivery/{id}:
 *   delete:
 *     tags:
 *       - Delivery
 *     summary: Delete a delivery by ID
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
 *         description: Delivery deleted successfully
 */
//router.delete("/deleteDelivery/:id", verifyToken, deleteDelivery);

module.exports = router;
