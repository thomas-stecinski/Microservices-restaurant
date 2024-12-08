using System;
using Livraison;
using Microsoft.EntityFrameworkCore;
using Livraison.Services;
using Livraison.Repository;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure DbContext with SQL Server
builder.Services.AddDbContext<LivraisonDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Register repositories and services
builder.Services.AddScoped<IDeliveryRepository, DeliveryRepository>();
builder.Services.AddScoped<IDeliveryService, DeliveryService>();

// Register RabbitMQService as a singleton
builder.Services.AddSingleton<RabbitMQService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();


var rabbitMQService = app.Services.GetRequiredService<RabbitMQService>();

rabbitMQService.ConsumeEvent("commande_created", (message) =>
{
    Console.WriteLine($"[RabbitMQ] Received commande_created: {message}");

});

app.Run();
