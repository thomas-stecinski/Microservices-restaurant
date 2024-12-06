using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Livraison.Models;
using Microsoft.EntityFrameworkCore;


namespace Livraison.Repository
{
 
    public interface IRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<T> GetByIdAsync(string id);
        Task AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(string id);
    }

    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly LivraisonDbContext _context;
        private readonly DbSet<T> _dbSet;

        public Repository(LivraisonDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task<T> GetByIdAsync(string id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task AddAsync(T entity)
        {

            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            var entity = await _dbSet.FindAsync(id);
            if (entity != null)
            {
                _dbSet.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }
    }

    public interface IDeliveryRepository : IRepository<Delivery>
    {

    }
    public class DeliveryRepository : IDeliveryRepository
    {
        private readonly LivraisonDbContext _context;

        public DeliveryRepository(LivraisonDbContext context)
        {
            _context = context;
        }


        public async Task<Delivery> GetByIdAsync(string id)
        {
            var produit = await _context.Deliveries.FindAsync(id);

            if (produit == null)
            {
                throw new KeyNotFoundException($"La livraison avec l'ID {id} n'a pas été trouvé.");
            }

            return produit;
        }

        public async Task<IEnumerable<Delivery>> GetAllAsync()
        {
            return await _context.Deliveries.ToListAsync();
        }

        public async Task AddAsync(Delivery entity)
        {
            await _context.Deliveries.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Delivery entity)
        {
            _context.Deliveries.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            var produit = await GetByIdAsync(id);
            if (produit != null)
            {
                _context.Deliveries.Remove(produit);
                await _context.SaveChangesAsync();
            }
        }

    }
}
