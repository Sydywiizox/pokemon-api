const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const offerCtrl = require("../controllers/offer");

// Routes publiques
router.get("/", offerCtrl.getAllOffers);
router.get("/:id", offerCtrl.getOfferById);
router.get("/card/:id", offerCtrl.getOffersByCardId);

// Routes protégées (nécessitent une authentification)
router.get("/user/offers", auth, offerCtrl.getUserOffers);
router.post("/", auth, offerCtrl.createOffer);
router.put("/:id", auth, offerCtrl.updateOffer);
router.delete("/:id", auth, offerCtrl.deleteOffer);

module.exports = router;
