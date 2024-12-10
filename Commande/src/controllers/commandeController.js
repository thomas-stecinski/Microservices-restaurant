

const Commande = require('../models/commande');
const { publishMessage } = require('../utils/rabbitmq');
const {sign} = require("jsonwebtoken");

exports.createCommande = async (req, res) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'La commande doit contenir au moins un article.' });
  }

  try {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newCommande = await Commande.create({ items, total });
    const token = sign({ id: newCommande.clientId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await publishMessage('commande_created', {
      id: newCommande._id,
      items: newCommande.items,
      total: newCommande.total,
      status: newCommande.status,
      createdAt: newCommande.createdAt,
      token,
    });

    res.status(201).json(newCommande);
  } catch (error) {
    console.error('Erreur lors de la création de la commande :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};


exports.getCommande = async (req, res) => {
  const { id } = req.params;

  try {
    const commande = await Commande.findById(id);
    if (!commande) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    res.json(commande);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};


exports.listCommandes = async (req, res) => {
  const clientId = req.user.id;

  try {
    const commandes = await Commande.find({ clientId });
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};


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
        { new: true }
    );

    if (!updatedCommande) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    await publishMessage('commande_status_updated', updatedCommande);

    res.json(updatedCommande);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};


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

    await publishMessage('commande_canceled', canceledCommande);

    res.json(canceledCommande);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};