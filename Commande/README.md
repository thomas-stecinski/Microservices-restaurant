
Méthode	    Endpoint	Description
POST	    /commande	Créer une commande
GET	    /commande/:id	Consulter une commande par ID
GET	    /commandes	    Lister toutes les commandes
PUT	    /commande/:id	Mettre à jour une commande
DELETE	/commande/:id	Annuler une commande


{
  "id": 1,
  "clientId": 42,
  "items": [
    { "name": "Pizza Margherita", "quantity": 2, "price": 12.5 },
    { "name": "Coca-Cola", "quantity": 1, "price": 3.0 }
  ],
  "status": "En attente",
  "total": 28.0,
  "createdAt": "2024-12-03T10:00:00Z"
}
