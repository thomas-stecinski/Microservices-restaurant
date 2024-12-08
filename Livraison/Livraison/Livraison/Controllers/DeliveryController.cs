using Livraison.Models;
using Livraison.Repository;
using Livraison.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Livraison.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeliveryController : ControllerBase
    {
        private readonly IDeliveryService _deliveryService;
        private readonly RabbitMQService _rabbitMQService;

        public DeliveryController(IDeliveryService deliveryService, RabbitMQService rabbitMQService)
        {
            _deliveryService = deliveryService;
            _rabbitMQService = rabbitMQService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDeliveries()
        {
            var deliveries = await _deliveryService.GetAllDeliveriesAsync();
            return Ok(deliveries);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDeliveryById(string id)
        {
            var delivery = await _deliveryService.GetDeliveryByIdAsync(id);
            if (delivery == null)
                return NotFound();
            return Ok(delivery);
        }

        [HttpPost]
        public async Task<IActionResult> AddDelivery(Delivery delivery)
        {
            await _deliveryService.AddDeliveryAsync(delivery);
            return StatusCode(201, delivery);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDelivery(string id, Delivery delivery)
        {
            await _deliveryService.UpdateDeliveryAsync(id, delivery);

            // Publier l'événement `delivery_status_updated` dans RabbitMQ
            var deliveryEvent = new { Id = id, Status = delivery.Status };
            _rabbitMQService.PublishEvent("delivery_status_updated", deliveryEvent);

            return StatusCode(201, delivery);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDelivery(string id)
        {
            await _deliveryService.DeleteDeliveryAsync(id);
            return NoContent();
        }
    }
}
