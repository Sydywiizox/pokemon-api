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
app.use(
  cors({
    origin: ["http://localhost:5173", "https://pokemon-trader.sydy.fr"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Middleware pour les en-têtes CORS personnalisés
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (
    origin === "http://localhost:5173" ||
    origin === "https://pokemon-trader.sydy.fr"
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// Ajouter cette ligne avec les autres routes
app.use("/api/messages", messageRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/offers", offerRoutes);

module.exports = app;
