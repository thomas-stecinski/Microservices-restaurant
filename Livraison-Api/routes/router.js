const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');


const deliveryRoutes = require("./delivery");


router.use("/delivery", deliveryRoutes); 

module.exports = router;
