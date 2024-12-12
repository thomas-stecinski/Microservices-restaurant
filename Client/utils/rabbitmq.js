const amqp = require('amqplib');

let channel;

const connectRabbitMQ = async (retries = 5, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Tentative de connexion à RabbitMQ (${i + 1}/${retries})...`);
            const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672');
            channel = await connection.createChannel();
            console.log('RabbitMQ connecté');
            return;
        } catch (error) {
            console.error(`Erreur de connexion à RabbitMQ : ${error.message}`);
            if (i < retries - 1) {
                console.log(`Nouvelle tentative dans ${delay / 1000} secondes...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                console.error('Impossible de se connecter à RabbitMQ après plusieurs tentatives');
                throw error;
            }
        }
    }
};

const publishMessage = async (queue, message) => {
    if (!channel) {
        console.error('RabbitMQ non connecté');
        throw new Error('RabbitMQ non connecté.');
    }
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log(`Message envoyé à la queue "${queue}":`, message);
};

module.exports = { connectRabbitMQ, publishMessage };
