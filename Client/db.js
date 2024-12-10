const mysql = require('mysql2');


const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "restaurant_client",
});

db.query('SELECT DATABASE()', (err, results) => {
    if (err) {
        console.error('Erreur lors de la connexion à la base de données:', err);
    } else {
        console.log('Base de données sélectionnée:', results);
    }
});

module.exports = db;
