const Offer = require("../models/Offer");

// Validation des données d'entrée
const validateOfferData = (data) => {
  const errors = {};
  if (!data.card_id) errors.card_id = "L'ID de la carte est requis";
  if (!data.quantity || data.quantity < 1)
    errors.quantity = "La quantité doit être supérieure à 0";
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Créer une offre
exports.createOffer = async (req, res) => {
  try {
    const validation = validateOfferData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Vérifier si l'utilisateur a déjà une offre pour cette carte
    const existingOffer = await Offer.findOne({
      user_id: req.auth.userId,
      card_id: req.body.card_id,
    });

    if (existingOffer) {
      // Mettre à jour l'offre existante
      const updatedOffer = await Offer.findByIdAndUpdate(
        existingOffer._id,
        {
          quantity: existingOffer.quantity + parseInt(req.body.quantity),
          description: req.body.description || existingOffer.description, // Garde l'ancienne description si pas de nouvelle
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Offre mise à jour avec succès",
        offer: updatedOffer,
      });
    }

    // Créer une nouvelle offre si elle n'existe pas
    const offer = new Offer({
      user_id: req.auth.userId,
      card_id: req.body.card_id,
      description: req.body.description,
      quantity: req.body.quantity,
    });

    const savedOffer = await offer.save();
    res.status(201).json({
      message: "Offre créée avec succès",
      offer: savedOffer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création de l'offre",
      error: error.message,
    });
  }
};

// Récupérer toutes les offres
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find();
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des offres",
      error: error.message,
    });
  }
};

// Récupérer les offres de l'utilisateur connecté
exports.getUserOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ user_id: req.auth.userId })
      .sort({ timestamp: -1 })
      .exec();
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de vos offres",
      error: error.message,
    });
  }
};

// Récupérer une offre par ID
exports.getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }
    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de l'offre",
      error: error.message,
    });
  }
};

// Récupérer les offres par ID de carte
exports.getOffersByCardId = async (req, res) => {
  try {
    const offers = await Offer.find({
      card_id: req.params.id,
      quantity: { $gt: 0 }, // Vérifie que la quantité est supérieure à 0
    })
      .populate("user_id", "name")
      .sort({ timestamp: -1 })
      .exec();

    const offersWithUsername = offers.map((offer) => ({
      _id: offer._id,
      card_id: offer.card_id,
      description: offer.description,
      quantity: offer.quantity,
      timestamp: offer.timestamp,
      user_id: offer.user_id._id,
      username: offer.user_id.name,
    }));

    res.status(200).json(offersWithUsername);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des offres",
      error: error.message,
    });
  }
};

// Mettre à jour une offre
exports.updateOffer = async (req, res) => {
  try {
    const validation = validateOfferData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Vérifier que l'offre appartient à l'utilisateur
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    if (offer.user_id.toString() !== req.auth.userId) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      {
        card_id: req.body.card_id,
        description: req.body.description,
        quantity: req.body.quantity,
        timestamp: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({
      message: "Offre mise à jour avec succès",
      offer: updatedOffer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'offre",
      error: error.message,
    });
  }
};

// Supprimer une offre
exports.deleteOffer = async (req, res) => {
  try {
    // Vérifier que l'offre appartient à l'utilisateur
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    if (offer.user_id.toString() !== req.auth.userId) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const deletedOffer = await Offer.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Offre supprimée avec succès",
      offer: deletedOffer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de l'offre",
      error: error.message,
    });
  }
};
