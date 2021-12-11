var mongoose = require("mongoose");

const Products = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    availableQuantity: { type: Array, required: true },
    initialQuantity: { type: Array, required: true },
    price: { type: String, required: true },
    priceUnit: { type: String, required: true },
    subscription: { type: String, required: false },
    discount:{type:Number, required: false},
    category: {
      type: String,
      required: true,
    },
    status: { type: String, required: false },
    description: { type: String, required: false },
  },
  { collection: "products-details" }
);

module.exports = mongoose.model("Products", Products);
