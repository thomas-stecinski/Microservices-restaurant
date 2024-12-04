const express = require('express');
const clientRoutes = require('./clientRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

router.use('/clients', clientRoutes);
router.use('/auth', authRoutes);

module.exports = router;
