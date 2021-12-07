var mongoose = require("mongoose");

const Address = new mongoose.Schema(
  {
    address1: { type: String, required: true },
    address2: { type: String, required: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    phone: { type:Number, required: true },
    pinCode: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { collection: "address" }
);

module.exports = mongoose.model("Address", Address);
