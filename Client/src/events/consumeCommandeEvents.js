const { connectRabbitMQ, consumeMessages } = require('../utils/rabbitmq');

const handleCommandeEvent = (message) => {
  if (message.eventType === 'CommandeCréée') {
    console.log('Nouvelle commande reçue pour le client :', message.commande);
  }
};

const startConsumer = async () => {
  try {
    await connectRabbitMQ();
    consumeMessages('commande.events', handleCommandeEvent);
  } catch (error) {
    console.error('Erreur lors du démarrage du consommateur RabbitMQ :', error);
  }
};

startConsumer();
