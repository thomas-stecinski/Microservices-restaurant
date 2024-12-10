const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
    items: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        }
    ],
    status: {
        type: String,
        enum: ['En attente', 'Livrée', 'Annulée'],
        default: 'En attente',
    },
    total: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Commande', commandeSchema);
