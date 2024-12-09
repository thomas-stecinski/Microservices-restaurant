const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const userRoutes = require("./user");
const deliveryRoutes = require("./delivery");

router.use("/auth", authRoutes); 
router.use("/users", userRoutes); 
router.use("/delivery", deliveryRoutes); 

module.exports = router;
