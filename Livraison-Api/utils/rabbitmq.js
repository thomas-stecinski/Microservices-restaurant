const amqp = require('amqplib');

let channel;

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        channel = await connection.createChannel();
        console.log('RabbitMQ connected');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
};

const publishMessage = async (queue, message) => {
    if (!channel) {
        console.error('RabbitMQ not connected');
        return;
    }
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log(`Message published to ${queue}:`, message);
};

const consumeMessage = async (queue, onMessage) => {
    if (!channel) {
        console.error('RabbitMQ not connected');
        return;
    }
    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, (msg) => {
        onMessage(JSON.parse(msg.content.toString()));
        channel.ack(msg);
    });
    console.log(`Consuming messages from ${queue}`);
};

module.exports = { connectRabbitMQ, publishMessage, consumeMessage };
