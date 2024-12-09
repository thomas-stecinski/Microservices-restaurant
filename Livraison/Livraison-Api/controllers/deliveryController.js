const DELIVERY = require("../models/Delivery");
const jwt = require("jsonwebtoken");

exports.createDelivery = async (req, res) => {

  try {

    const { idComande, idClient, idLivreur, adresse, ville, status, prix, dateLivraison } = req.body;

    const token = req.header("Authorization")?.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    

    const newDelivery = new CV({ idComande, idClient, idLivreur, adresse, ville, status, prix, dateLivraison });
    await newDelivery.save();
    res.status(201).json({ message: newDelivery });

  } catch (err) {

    res.status(500).json({ message: "Erreur serveur", error: err.message });
    
  }

};



exports.updateDelivery = async (req, res) => {

  try {

    const deliveryId = req.params.id;
    const deliveryData = req.body;

    const token = req.header("Authorization")?.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    

    const updatedDelivery = await DELIVERY.findOneAndUpdate(
      { _id: deliveryId, userId: userId }, 
      deliveryData, 
      { new: true, runValidators: true } 
    );
    if (!updatedDelivery) {
      return res.status(404).json({ 
        message: "Delivery non trouvé"
      });
    }

    res.status(200).json({ 
      message: "Delivery mis à jour avec succès", 
      delivery: updatedDelivery 
    });

  } catch (err) {

    res.status(500).json({ message: "Erreur serveur", error: err.message });
    
  }

};


exports.detailsDelivery = async (req, res) => {

  const deliveryId = req.params.id;

  try {

    const deliveryDetails = await DELIVERY.findOne({ _id: deliveryId });

    if (!deliveryDetails) {
      return res.status(404).json({ message: "deliveryDetails non trouvé ou non visible." });
    }

    // Retourner le CV trouvé
    res.status(200).json({
      message: "Détails du CV",
      delivery: deliveryDetails,
    });

  } catch (err) {
    res.status(500).json({
      message: "Erreur serveur",
      error: err.message,
    });
  }

  exports.deleteDelivery = async (req, res) => {
    const deliveryId = req.params.id;

    try {
        const delivery = await DELIVERY.findById(deliveryId);
        if (!delivery) {
            return res.status(404).json({ message: "Delivery non trouvée." });
        }

        await DELIVERY.findByIdAndDelete(deliveryId);
        return res.status(200).json({ message: "Delivery supprimée avec succès." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur lors de la suppression de la delivery." });
    }
};



};


 
