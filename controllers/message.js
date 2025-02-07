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

    // Récupérer le message avec les informations complètes
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("sender_id", "name")
      .populate("receiver_id", "name")
      .populate("offer_id");

    // Émettre l'événement newMessage
    const io = req.app.get("io");
    if (io) {
      io.emit("newMessage", populatedMessage);
    }

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

// Marquer les messages comme lus
exports.markAsRead = async (req, res) => {
  try {
    const { senderId, offerId } = req.body;

    const result = await Message.updateMany(
      {
        sender_id: senderId,
        receiver_id: req.auth.userId,
        offer_id: offerId,
        read: false,
      },
      { read: true }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(200)
        .json({ message: "Aucun message à marquer comme lu" });
    }

    res.status(200).json({
      message: "Messages marqués comme lus",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour des messages",
      error: error.message,
    });
  }
};
