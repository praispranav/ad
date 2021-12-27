var mongoose = require("mongoose");

const ExtraQuanities = mongoose.Schema(
  {
    date: { type: Date, required: true },
    comment: { type: String, required: false },
    subscriptionId: { type: String, required: true },
    approved: { type: Boolean, required: true },
  },
  { collection: "cancelled-deliveries" }
);

module.exports = mongoose.model("Cancelled Deliveries", ExtraQuanities);
