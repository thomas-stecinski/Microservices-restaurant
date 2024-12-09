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
const { verifyToken } = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /api/delivery/createDelivery:
 *   post:
 *     tags:
 *       - Delivery
 *     summary: Create a new delivery
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Delivery created successfully
 */
router.post("/createDelivery", verifyToken, createDelivery);

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
router.put("/updateDelivery/:id", verifyToken, updateDelivery);

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
router.get("/detailsDelivery/:id", verifyToken, detailsDelivery);

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
