const amqp = require('amqplib');

let channel;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    console.log('Connecté à RabbitMQ');
  } catch (error) {
    console.error('Erreur de connexion à RabbitMQ :', error);
    throw error;
  }
};

const publishMessage = async (queue, message) => {
  if (!channel) {
    console.error('RabbitMQ non connecté');
    return;
  }
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  console.log(`Message publié sur la queue "${queue}":`, message);
};

const consumeMessage = async (queue, callback) => {
  if (!channel) {
    console.error('RabbitMQ non connecté');
    return;
  }
  await channel.assertQueue(queue, { durable: true });
  channel.consume(queue, (message) => {
    if (message !== null) {
      const content = JSON.parse(message.content.toString());
      console.log(`Message reçu depuis la queue "${queue}":`, content);
      callback(content);
      channel.ack(message);
    }
  });
};

module.exports = { connectRabbitMQ, publishMessage, consumeMessage };
