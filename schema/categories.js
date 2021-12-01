var mongoose = require("mongoose");

const Products = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    availableQuantity: { type: Array, required: true },
    initialQuantity: { type: Array, required: true },
    price: { type: Number, required: true },
    priceUnit: { type: String, required: true },
    subscription: { type: String, required: false },
    category: {
      type: String,
      required: true,
    },
    status:{type:String, required: false}
  },
  { collection: "products-details" }
);

module.exports = mongoose.model("Products", Products);
