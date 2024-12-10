const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const commandeController = require('../controllers/commandeController');
const router = express.Router();

router.post('/', authenticateToken, commandeController.createCommande);
router.get('/:id', authenticateToken, commandeController.getCommande);
router.get('/', authenticateToken, commandeController.listCommandes);
router.put('/:id/status', authenticateToken, commandeController.updateCommandeStatus);
router.delete('/:id', authenticateToken, commandeController.cancelCommande);

module.exports = router;
