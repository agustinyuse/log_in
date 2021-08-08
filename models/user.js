const mongoose = require("mongoose");

module.exports = mongoose.model("Users", {
  username: String,
  password: String,
  facebook_id: String,
  email: String,
  photo: String,
});
