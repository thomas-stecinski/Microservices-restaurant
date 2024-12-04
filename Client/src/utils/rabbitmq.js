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

const consumeMessages = async (queue, callback) => {
  if (!channel) {
    console.error('RabbitMQ non connecté');
    return;
  }
  await channel.assertQueue(queue, { durable: true });
  channel.consume(queue, (msg) => {
    if (msg) {
      const message = JSON.parse(msg.content.toString());
      console.log(`Message reçu depuis la queue "${queue}":`, message);
      callback(message);
      channel.ack(msg);
    }
  });
};

module.exports = { connectRabbitMQ, publishMessage, consumeMessages };
