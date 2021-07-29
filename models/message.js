const mongoose = require("mongoose");

const schema = mongoose.Schema({
  message: { type: String, require: true },
  email: { type: String, require: true },
  timestamp: { type: Date, default: new Date() },
});

const Message = mongoose.model("messages", schema);

module.exports = Message;
