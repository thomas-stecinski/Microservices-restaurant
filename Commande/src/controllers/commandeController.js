const Commande = require('../models/commande');
const { publishMessage } = require('../utils/rabbitmq');
const mongoose = require('mongoose');

// Créer une commande
exports.createCommande = async (req, res) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'La commande doit contenir au moins un article.' });}
    
  const newCommande = {
    id: commandes.length + 1,
    clientId,
    items,
    status: 'En attente',
    total,
    createdAt: new Date(),
  };

  commandes.push(newCommande);

  try {
    await publishMessage('commande_created', newCommande);
    console.log('Événement commande_created publié:', newCommande);
  } catch (error) {
    console.error('Erreur de publication RabbitMQ:', error);
  }

  // Calculer le total
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    // Créer une nouvelle commande
    const newCommande = await Commande.create({
      items,
      total,
    });

    // Publier l'événement dans RabbitMQ
    await publishMessage('commande_created', {
      id: newCommande._id,
      items: newCommande.items,
      total: newCommande.total,
      status: newCommande.status,
      createdAt: newCommande.createdAt,
    });

    console.log('Commande créée et événement publié.');
    res.status(201).json(newCommande);
  } catch (error) {
    console.error('Erreur lors de la création de la commande :', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};


// Récupérer une commande par ID
exports.getCommande = async (req, res) => {
  const { id } = req.params;

  try {
    const commande = await Commande.findById(id);
    if (!commande) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    res.json(commande);
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

// Lister toutes les commandes du client authentifié
exports.listCommandes = async (req, res) => {
  const clientId = req.user.id;

  try {
    const commandes = await Commande.find({ clientId });
    res.json(commandes);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

// Mettre à jour le statut d'une commande
exports.updateCommandeStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Le statut est requis.' });
  }

  try {
    const updatedCommande = await Commande.findByIdAndUpdate(
        id,
        { status },
        { new: true } // Retourner le document mis à jour
    );

    if (!updatedCommande) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    // Publier un événement de mise à jour du statut
    await publishMessage('commande_status_updated', updatedCommande);
    console.log(`Événement commande_status_updated publié :`, updatedCommande);

    res.json(updatedCommande);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

// Annuler une commande
exports.cancelCommande = async (req, res) => {
  const { id } = req.params;

  try {
    const canceledCommande = await Commande.findByIdAndUpdate(
        id,
        { status: 'Annulée' },
        { new: true }
    );

    if (!canceledCommande) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    // Publier un événement pour signaler l'annulation
    await publishMessage('commande_canceled', canceledCommande);
    console.log(`Événement commande_canceled publié :`, canceledCommande);

    res.json(canceledCommande);
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};
