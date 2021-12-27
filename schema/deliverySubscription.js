var mongoose = require("mongoose");

const ExtraQuanities = mongoose.Schema(
  {
    comment: { type: String, required: true },
    status: { type: String, required: true },
    deliveryDate: { type: Date, required: true },
    quantity: { type: Number, required: true },
    subscriptionId:{type:String, required: true}
  },
  { collection: "deliveries" }
);

module.exports = mongoose.model("Deleivered Quantity", ExtraQuanities);
