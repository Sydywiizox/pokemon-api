const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
        name: req.body.name,
      });
      user
        .save()
        .then((savedUser) => {
          const token = jwt.sign(
            { userId: savedUser._id },
            process.env.TOKEN_SECRET
          );
          res.status(201).json({
            message: "Utilisateur créé !",
            userId: savedUser._id,
            token: token,
          });
        })
        .catch((error) => {
          if (error.code === 11000) {
            // Analyse du champ en doublon
            const duplicateField = Object.keys(error.keyValue)[0];
            if (duplicateField === "email") {
              res
                .status(400)
                .json({ error: "Email déjà utilisé !", type: "email" });
            } else if (duplicateField === "name") {
              res
                .status(400)
                .json({ error: "Nom déjà utilisé !", type: "name" });
            } else {
              res.status(400).json({ error: "Conflit de duplication !" });
            }
          } else {
            res.status(500).json({ error });
          }
        });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({
    $or: [
      { email: req.body.identifier.toLowerCase() },
      { name: { $regex: new RegExp("^" + req.body.identifier + "$", "i") } },
    ],
  })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
