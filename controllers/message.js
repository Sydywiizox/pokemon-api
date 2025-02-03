const Message = require("../models/Message");

// Créer un nouveau message
exports.createMessage = async (req, res) => {
  try {
    const message = new Message({
      sender_id: req.auth.userId,
      receiver_id: req.body.receiver_id,
      content: req.body.content,
      offer_id: req.body.offer_id,
    });

    const savedMessage = await message.save();
    res.status(201).json({
      message: "Message envoyé avec succès",
      data: savedMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'envoi du message",
      error: error.message,
    });
  }
};

// Récupérer tous les messages d'une conversation
exports.getConversation = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender_id: req.auth.userId, receiver_id: req.params.receiver_id },
        { sender_id: req.params.sender_id, receiver_id: req.auth.userId },
      ],
    })
      .populate("sender_id", "name")
      .populate("receiver_id", "name")
      .populate("offer_id")
      .sort({ timestamp: -1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des messages",
      error: error.message,
    });
  }
};

// Récupérer toutes les conversations de l'utilisateur
exports.getAllUserConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender_id: req.auth.userId }, { receiver_id: req.auth.userId }],
    })
      .populate("sender_id", "name")
      .populate("receiver_id", "name")
      .populate("offer_id")
      .sort({ timestamp: -1 });

    res.status(200).json({
      conversations: messages,
      id: req.auth.userId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des conversations",
      error: error.message,
    });
  }
};
