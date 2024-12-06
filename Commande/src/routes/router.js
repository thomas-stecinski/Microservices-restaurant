const express = require('express');
const commandeRoutes = require('./commandeRoutes');

const router = express.Router();

router.use('/commandes', commandeRoutes);

module.exports = router;
