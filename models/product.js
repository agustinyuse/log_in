const mongoose = require("mongoose");

const schema = mongoose.Schema({
  title: { type: String, require: true },
  price: { type: Number, require: true },
  thumbnail: { type: String },
  timestamp: { type: Date, default: new Date() },
});

const Product = mongoose.model("products", schema);

module.exports = Product;
