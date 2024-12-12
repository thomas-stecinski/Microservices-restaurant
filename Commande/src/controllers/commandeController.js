const Commande = require('../models/commande');
const { publishMessage } = require('../utils/rabbitmq');

exports.createCommande = async (req, res) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    console.error('Aucun article dans la commande.');
    return res.status(400).json({ error: 'La commande doit contenir au moins un article.' });
  }

  try {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const clientId = req.user.id; // Récupération du clientId depuis req.user

    console.log(`Création de commande pour clientId: ${clientId}`);
    const newCommande = await Commande.create({ items, total, clientId });

    // Publier l'événement sur RabbitMQ
    await publishMessage('commande_created', {
      id: newCommande._id,
      items: newCommande.items,
      total: newCommande.total,
      status: newCommande.status,
      createdAt: newCommande.createdAt,
      clientId: newCommande.clientId,
    });

    console.log('Commande créée avec succès et publiée sur RabbitMQ.');
    res.status(201).json(newCommande);
  } catch (error) {
    console.error('Erreur lors de la création de la commande :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

exports.getCommande = async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`Récupération de la commande avec id: ${id}`);
    const commande = await Commande.findById(id);

    if (!commande) {
      console.error('Commande non trouvée.');
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    res.json(commande);
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

exports.listCommandes = async (req, res) => {
  const clientId = req.user.id;

  try {
    console.log(`Récupération des commandes pour clientId: ${clientId}`);
    const commandes = await Commande.find({ clientId }); // Recherche par clientId

    if (commandes.length === 0) {
      console.log('Aucune commande trouvée pour ce client.');
    } else {
      console.log(`${commandes.length} commandes trouvées pour clientId: ${clientId}`);
    }

    res.json(commandes);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

exports.updateCommandeStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    console.error('Statut non fourni.');
    return res.status(400).json({ error: 'Le statut est requis.' });
  }

  try {
    console.log(`Mise à jour du statut de la commande ${id} en ${status}`);
    const updatedCommande = await Commande.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedCommande) {
      console.error('Commande non trouvée.');
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    await publishMessage('commande_status_updated', updatedCommande);
    console.log('Statut de la commande mis à jour et publié sur RabbitMQ.');

    res.json(updatedCommande);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de la commande :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

exports.cancelCommande = async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`Annulation de la commande ${id}`);
    const canceledCommande = await Commande.findByIdAndUpdate(
      id,
      { status: 'Annulée' },
      { new: true }
    );

    if (!canceledCommande) {
      console.error('Commande non trouvée.');
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    await publishMessage('commande_canceled', canceledCommande);
    console.log('Commande annulée et publiée sur RabbitMQ.');

    res.json(canceledCommande);
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};
