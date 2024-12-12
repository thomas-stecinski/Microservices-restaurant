const Delivery = require('../models/Delivery');
const { publishMessage } = require('../utils/rabbitmq');
const mongoose = require('mongoose');

// Créer une nouvelle livraison
exports.createDelivery = async (req, res) => {
  try {
    const { idCommande, adresse, ville, prix, dateLivraison } = req.body;

    if (!idCommande || !adresse || !ville || !prix) {
      console.error('Données de livraison incomplètes.');
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
    }

    const clientId = req.user.id; // ID utilisateur depuis le token JWT

    // Création de la livraison
    const newDelivery = await Delivery.create({
      idCommande: mongoose.Types.ObjectId(idCommande),
      idClient: mongoose.Types.ObjectId(clientId),
      adresse,
      ville,
      status: 'En attente', // Statut par défaut
      prix,
      dateLivraison: dateLivraison || new Date(), // Valeur par défaut
    });

    // Publier l'événement dans RabbitMQ
    await publishMessage('delivery_created', {
      id: newDelivery._id,
      idCommande: newDelivery.idCommande,
      idClient: newDelivery.idClient,
      adresse: newDelivery.adresse,
      ville: newDelivery.ville,
      status: newDelivery.status,
      prix: newDelivery.prix,
      dateLivraison: newDelivery.dateLivraison,
    });

    console.log('Livraison créée avec succès.');
    res.status(201).json({ message: 'Livraison créée avec succès.', delivery: newDelivery });
  } catch (err) {
    console.error('Erreur lors de la création de la livraison :', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.', error: err.message });
  }
};

// Mettre à jour une livraison
exports.updateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      console.error('Statut non fourni.');
      return res.status(400).json({ message: 'Le statut est obligatoire.' });
    }

    const updatedDelivery = await Delivery.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedDelivery) {
      console.error('Livraison non trouvée.');
      return res.status(404).json({ message: 'Livraison non trouvée.' });
    }

    // Publier l'événement dans RabbitMQ
    await publishMessage('delivery_updated', updatedDelivery);

    console.log('Livraison mise à jour avec succès.');
    res.status(200).json({ message: 'Livraison mise à jour avec succès.', delivery: updatedDelivery });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la livraison :', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.', error: err.message });
  }
};

// Récupérer une livraison
exports.getDeliveryDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      console.error('Livraison non trouvée.');
      return res.status(404).json({ message: 'Livraison non trouvée.' });
    }

    res.status(200).json({ message: 'Livraison récupérée avec succès.', delivery });
  } catch (err) {
    console.error('Erreur lors de la récupération de la livraison :', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.', error: err.message });
  }
};

// Supprimer une livraison
exports.deleteDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDelivery = await Delivery.findByIdAndDelete(id);
    if (!deletedDelivery) {
      console.error('Livraison non trouvée.');
      return res.status(404).json({ message: 'Livraison non trouvée.' });
    }

    // Publier l'événement dans RabbitMQ
    await publishMessage('delivery_deleted', { id });

    console.log('Livraison supprimée avec succès.');
    res.status(200).json({ message: 'Livraison supprimée avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la suppression de la livraison :', err.message);
    res.status(500).json({ message: 'Erreur interne du serveur.', error: err.message });
  }
};
