const express = require("express");
const mongoose = require("mongoose");
const app = express();
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
const messageRoutes = require("./routes/message");
const path = require("path");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Middleware CORS personnalisé
app.use((req, res, next) => {
  // Autoriser toutes les origines
  res.header("Access-Control-Allow-Origin", "*");

  // En-têtes autorisés
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Méthodes autorisées
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  // Gérer les requêtes OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(express.json());

// Routes
app.use("/api/messages", messageRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/offers", offerRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Une erreur est survenue",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;
