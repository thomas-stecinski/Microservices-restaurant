const commandes = [];

exports.createCommande = (req, res) => {
  const { clientId, items } = req.body;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const newCommande = {
    id: commandes.length + 1,
    clientId,
    items,
    status: 'En attente',
    total,
    createdAt: new Date()
  };
  commandes.push(newCommande);
  res.status(201).json(newCommande);
};

exports.getCommande = (req, res) => {
  const commande = commandes.find(c => c.id === parseInt(req.params.id));
  if (!commande) return res.status(404).json({ error: 'Commande non trouvée' });
  res.json(commande);
};

exports.listCommandes = (req, res) => {
  res.json(commandes);
};

exports.updateCommandeStatus = (req, res) => {
  const commande = commandes.find(c => c.id === parseInt(req.params.id));
  if (!commande) return res.status(404).json({ error: 'Commande non trouvée' });

  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Statut requis' });

  commande.status = status;
  res.json(commande);
};

exports.cancelCommande = (req, res) => {
  const index = commandes.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Commande non trouvée' });
  commandes[index].status = 'Annulée';
  res.json(commandes[index]);
};
