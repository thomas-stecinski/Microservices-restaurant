const DELIVERY = require("../models/Delivery");
const jwt = require("jsonwebtoken");
const { publishMessage } = require("../utils/rabbitmq");
const mongoose = require('mongoose');


exports.createDelivery = async (req, res) => {
  try {
    const { idComande, idClient, idLivreur, adresse, ville, status, prix, dateLivraison } = req.body;

    // Récupération et vérification du token JWT
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Token invalide : userId invalide." });
    }

    // Génération automatique des ObjectId si non fournis
    const commandeId = idComande && mongoose.Types.ObjectId.isValid(idComande)
        ? new mongoose.Types.ObjectId(idComande)
        : new mongoose.Types.ObjectId(); // Génère automatiquement un ObjectId
    const clientId = idClient && mongoose.Types.ObjectId.isValid(idClient)
        ? new mongoose.Types.ObjectId(idClient)
        : new mongoose.Types.ObjectId(); // Génère automatiquement un ObjectId
    const livreurId = idLivreur && mongoose.Types.ObjectId.isValid(idLivreur)
        ? new mongoose.Types.ObjectId(idLivreur)
        : new mongoose.Types.ObjectId(); // Génère automatiq
    const createdBy = new mongoose.Types.ObjectId(userId);

    // Création de la livraison
    const newDelivery = await DELIVERY.create({
      id: new mongoose.Types.ObjectId(),
      idComande: commandeId,
      idClient: clientId,
      idLivreur: livreurId,
      adresse,
      ville,
      status: status || "En attente",
      prix,
      dateLivraison,
      createdBy,
    });

    // Publication dans RabbitMQ
    await publishMessage("deliveryQueue", { type: "DELIVERY_CREATED", payload: newDelivery });

    res.status(201).json({ message: "Livraison créée avec succès", delivery: newDelivery });
  } catch (err) {
    console.error("Erreur lors de la création de la livraison :", err.message);
    res.status(500).json({ message: "Erreur interne du serveur.", error: err.message });
  }
};

exports.updateDelivery = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const deliveryData = req.body;

    // Decode JWT
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Update Delivery
    const updatedDelivery = await DELIVERY.findOneAndUpdate(
        { _id: deliveryId, createdBy: userId },
        deliveryData,
        { new: true, runValidators: true }
    );

    if (!updatedDelivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    // Publish event to RabbitMQ
    await publishMessage("deliveryQueue", { type: "DELIVERY_UPDATED", payload: updatedDelivery });

    res.status(200).json({
      message: "Delivery updated successfully",
      delivery: updatedDelivery,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.detailsDelivery = async (req, res) => {
  try {
    const deliveryId = req.params.id;

    const deliveryDetails = await DELIVERY.findOne({ _id: deliveryId });
    if (!deliveryDetails) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.status(200).json({
      message: "Delivery details fetched successfully",
      delivery: deliveryDetails,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteDelivery = async (req, res) => {
  try {
    const deliveryId = req.params.id;

    const delivery = await DELIVERY.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found." });
    }

    await DELIVERY.findByIdAndDelete(deliveryId);

    // Publish event to RabbitMQ
    await publishMessage("deliveryQueue", { type: "DELIVERY_DELETED", payload: { id: deliveryId } });

    res.status(200).json({ message: "Delivery deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
