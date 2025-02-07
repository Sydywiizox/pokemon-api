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

// Configuration CORS - doit être avant toutes les routes
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://pokemon-trader.sydy.fr",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Non autorisé par CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400,
  })
);

// Middleware pour gérer les erreurs CORS
app.use((err, req, res, next) => {
  if (err.message === "Non autorisé par CORS") {
    res.status(403).json({
      message: "Non autorisé par CORS",
      origin: req.headers.origin,
    });
  } else {
    next(err);
  }
});

// Middleware pour les en-têtes de sécurité
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

app.use(express.json());

// Ajouter cette ligne avec les autres routes
app.use("/api/messages", messageRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/offers", offerRoutes);

module.exports = app;
