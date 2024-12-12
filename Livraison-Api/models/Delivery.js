
const mongoose = require('mongoose');


const deliverySchema = new mongoose.Schema({
  idComande: { type: mongoose.Schema.Types.ObjectId, required: true },
  idClient: { type: mongoose.Schema.Types.ObjectId, required: true },
  idLivreur: { type: mongoose.Schema.Types.ObjectId },
  adresse: { type: String, required: true },
  ville: { type: String, required: true },
  status: {
    type: String,
    enum: ["En attente", "En cours", "Livrée", "Annulée"],
    default: "En attente",
  },
  prix: { type: Number, required: true },
  dateLivraison: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
});



module.exports = mongoose.model('Delivery', deliverySchema);