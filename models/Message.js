const mongoose = require("mongoose");

// Définir le schéma
const messageSchema = mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
  },
  offer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Créer le modèle
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
