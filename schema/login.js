var mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema(
  {
    userId:{ type: String, required: true },
    date: {type: Date, required: true }
  },
  { collection: "logins" }
);

module.exports = mongoose.model("Login", LoginSchema);
