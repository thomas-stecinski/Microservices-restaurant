const mongoose = require('mongoose');

// Définition du schéma pour Delivery
const deliverySchema = new mongoose.Schema({
  id: { type: String, required: true },  // Id de la livraison
  idComande: { type: String, required: true },  // Id de la commande
  idClient: { type: String, required: true },  // Id du client
  idLivreur: { type: String, required: true },  // Id du livreur
  adresse: { type: String, required: true },  // Adresse de livraison
  ville: { type: String, required: true },  // Ville de livraison
  status: { type: String, required: true },  // Statut de la livraison
  prix: { type: String, required: true },  // Prix de la livraison
  dateLivraison: { type: Date, required: true }  // Date de livraison
});

// Index unique pour garantir qu'il n'y ait pas de doublons sur l'ID de la livraison
deliverySchema.index({ id: 1 }, { unique: true });

// Exportation du modèle Delivery
module.exports = mongoose.model('DELIVERY', deliverySchema);
