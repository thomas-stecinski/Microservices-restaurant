using System;
using Livraison.Models;
using Microsoft.EntityFrameworkCore;

namespace Livraison
{
    public class LivraisonDbContext : DbContext
    {
        public DbSet<Delivery> Deliveries { get; set; }

        public LivraisonDbContext(DbContextOptions<LivraisonDbContext> options) : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

        }

    }
}
