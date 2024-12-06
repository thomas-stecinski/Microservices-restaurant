const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/commandeController');

router.post('/', commandeController.createCommande);
router.get('/:id', commandeController.getCommande);
router.get('/', commandeController.listCommandes);
router.put('/:id/status', commandeController.updateCommandeStatus);  
router.delete('/:id', commandeController.cancelCommande);

module.exports = router;
