var mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    forgetPasswordOtp: { type: Number, required: false, max: 999999 },
    forgetPasswordTime:{ type:Date, required: false},
    customerId:{ type:String, required: true}
  },
  { collection: "user" }
);

module.exports = mongoose.model("User", UserSchema);
