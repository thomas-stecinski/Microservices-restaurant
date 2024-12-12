const { consumeMessage, publishMessage } = require('./rabbitmq');
const Commande = require('../models/commande');

// Consommer les demandes de détails de commande
const consumeCommandeDetailsRequest = async () => {
  consumeMessage('commande_details_request', async (message) => {
    try {
      console.log(`Demande reçue pour les détails de la commande : ${message.idCommande}`);

      const commande = await Commande.findById(message.idCommande);

      if (!commande) {
        console.error(`Commande non trouvée pour id : ${message.idCommande}`);
        return;
      }

      // Publier les détails de la commande dans la file spécifiée par "replyTo"
      await publishMessage(message.replyTo, {
        idCommande: commande._id,
        total: commande.total,
        items: commande.items,
      });

      console.log(`Détails de la commande ${commande._id} publiés dans la file : ${message.replyTo}`);
    } catch (error) {
      console.error('Erreur lors du traitement de la demande de commande :', error.message);
    }
  });
};

module.exports = { consumeCommandeDetailsRequest };
