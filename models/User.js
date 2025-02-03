const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Convertir l'email en minuscules avant stockage
  },
  password: { type: String, required: true },
  name: {
    type: String,
    required: true,
  },
});

// Index pour email insensible à la casse
userSchema.index(
  { email: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

// Index pour name insensible à la casse
userSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

// Validation personnalisée pour vérifier l'unicité du nom en ignorant la casse
userSchema.pre("save", async function (next) {
  const existingUser = await this.constructor.findOne({
    name: { $regex: new RegExp(`^${this.name}$`, "i") },
  });
  if (existingUser && existingUser._id.toString() !== this._id.toString()) {
    return next(new Error("Name must be unique regardless of case."));
  }
  next();
});

// Plugin uniqueValidator pour valider l'unicité
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
