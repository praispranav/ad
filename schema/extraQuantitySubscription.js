var mongoose = require("mongoose");

const ExtraQuanities = mongoose.Schema(
  {
    date: { type: Date, required: true },
    quantity: { type: Number, required: true },
    subscriptionId: { type: String, required: true },
    approved: {type: Boolean, required: true}
  },
  { collection: "extra-quantities" }
);

module.exports = mongoose.model("Extra Quantity", ExtraQuanities);
