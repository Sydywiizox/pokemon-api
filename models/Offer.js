const mongoose = require("mongoose");

// Définir le schéma
const offerSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  card_id: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Créer le modèle
const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
