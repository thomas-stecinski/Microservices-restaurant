using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Livraison.Migrations
{
    /// <inheritdoc />
    public partial class deliveryEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Deliveries",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IdComande = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IdClient = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IdLivreur = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Adresse = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ville = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Prix = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DateLivraison = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deliveries", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Deliveries");
        }
    }
}
