using Livraison.Models;
using Livraison.Repository;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Livraison.Services
{
    public interface IDeliveryService
    {
        Task<IEnumerable<Delivery>> GetAllDeliveriesAsync();
        Task<Delivery> GetDeliveryByIdAsync(string id);
        Task AddDeliveryAsync(Delivery delivery);
        Task UpdateDeliveryAsync(string id, Delivery delivery);
        Task DeleteDeliveryAsync(string id);
    }

    public class DeliveryService : IDeliveryService
    {
        private readonly IDeliveryRepository _deliveryRepository;

        public DeliveryService(IDeliveryRepository repository)
        {
            _deliveryRepository = repository;
        }

        public async Task<IEnumerable<Delivery>> GetAllDeliveriesAsync()
        {
            return await _deliveryRepository.GetAllAsync();
        }

        public async Task<Delivery> GetDeliveryByIdAsync(string id)
        {
            return await _deliveryRepository.GetByIdAsync(id);
        }

        public async Task AddDeliveryAsync(Delivery delivery)
        {
            delivery.Id = Guid.NewGuid().ToString();
            await _deliveryRepository.AddAsync(delivery);
        }

        public async Task UpdateDeliveryAsync(string id, Delivery delivery)
        {
            var existingDelivery = await _deliveryRepository.GetByIdAsync(id);
            if (existingDelivery != null)
            {
                // Mise à jour des propriétés
                existingDelivery.Status = delivery.Status;
                existingDelivery.Adresse = delivery.Adresse;
                existingDelivery.IdClient = delivery.IdClient;
                existingDelivery.IdComande = delivery.IdComande;

                await _deliveryRepository.UpdateAsync(existingDelivery);
            }
        }

        public async Task DeleteDeliveryAsync(string id)
        {
            await _deliveryRepository.DeleteAsync(id);
        }
    }
}
