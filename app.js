const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
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

// Configuration CORS
const corsOptions = {
  origin: ["https://pokemon-trader.sydy.fr", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
  credentials: true,
  maxAge: 86400,
};

app.use(cors(corsOptions));

// Middleware pour les en-têtes supplémentaires
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (corsOptions.origin.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
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
