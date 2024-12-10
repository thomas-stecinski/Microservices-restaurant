const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { connectRabbitMQ, consumeMessage, publishMessage } = require("./utils/rabbitmq");
const routes = require("./routes/router");
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: "*",
  credentials: false,
}));

dotenv.config();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API pour gérer les livraisons et interagir avec RabbitMQ",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());

mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => console.log("MongoDB connecté"))
    .catch((err) => console.error("Erreur de connexion à MongoDB :", err));


connectRabbitMQ().then(() => {
  consumeMessage("commandeQueue", async (event) => {
    console.log("Événement reçu de commandeQueue :", event);

    if (event.type === "DELIVERY_CREATED") {
      try {
        const newDelivery = await DELIVERY.create(event.payload);
        console.log("Nouvelle livraison créée :", newDelivery);
      } catch (err) {
        console.error("Erreur lors de la création de la livraison depuis RabbitMQ :", err.message);
      }
    } else {
      console.log(`Événement non traité : ${event.type}`);
    }
  });
});


app.use("/api", routes);

app.post("/api/livraison-event", async (req, res) => {
  try {
    const { eventType, payload } = req.body;
    await publishMessage("deliveryQueue", { eventType, payload });
    res.status(200).send({ message: "Événement envoyé avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'événement :", error);
    res.status(500).send({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
