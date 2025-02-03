const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const messageCtrl = require("../controllers/message");

// Routes protégées (nécessitent une authentification)
router.post("/", auth, messageCtrl.createMessage);
router.get("/conversations", auth, messageCtrl.getAllUserConversations);
router.get("/conversation/:userId", auth, messageCtrl.getConversation);

module.exports = router;
