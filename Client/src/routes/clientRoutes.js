const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/auth');

router.post('/', clientController.createClient);

router.get('/', authMiddleware, clientController.listClients);

router.get('/:id', authMiddleware, clientController.getClient);

module.exports = router;
