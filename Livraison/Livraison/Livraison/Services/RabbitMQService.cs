using System;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Livraison.Services
{
    public class RabbitMQService : IDisposable
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;

        public RabbitMQService()
        {
            var factory = new ConnectionFactory
            {
                HostName = "localhost",
                Port = 5672,
                UserName = "guest",
                Password = "guest"
            };

            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();

            // Declare queues
            _channel.QueueDeclare(queue: QueueNames.CommandeCreated, durable: true, exclusive: false, autoDelete: false);
            _channel.QueueDeclare(queue: QueueNames.DeliveryStatusUpdated, durable: true, exclusive: false, autoDelete: false);
        }

        public async Task PublishEventAsync<T>(string queueName, T message)
        {
            try
            {
                var properties = _channel.CreateBasicProperties();
                properties.Persistent = true; // Ensures message durability

                var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));

                await Task.Run(() => _channel.BasicPublish(exchange: "",
                                      routingKey: queueName,
                                      basicProperties: properties,
                                      body: body));

                Console.WriteLine($"[RabbitMQ] Published to queue '{queueName}': {JsonSerializer.Serialize(message)}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RabbitMQ] Error publishing message: {ex.Message}");
            }
        }

        public async Task ConsumeEventAsync(string queueName, Action<string> callback)
        {
            try
            {
                var consumer = new AsyncEventingBasicConsumer(_channel);
                consumer.Received += async (model, ea) =>
                {
                    var body = ea.Body.ToArray();
                    var message = Encoding.UTF8.GetString(body);
                    Console.WriteLine($"[RabbitMQ] Received from queue '{queueName}': {message}");
                    callback(message);
                    await Task.CompletedTask;
                };

                await Task.Run(() => _channel.BasicConsume(queue: queueName,
                                      autoAck: true,
                                      consumer: consumer));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RabbitMQ] Error consuming message: {ex.Message}");
            }
        }

        public void Dispose()
        {
            _channel?.Close();
            _connection?.Close();
        }
    }

    public static class QueueNames
    {
        public const string CommandeCreated = "CommandeCreated";
        public const string DeliveryStatusUpdated = "DeliveryStatusUpdated";
    }
}
