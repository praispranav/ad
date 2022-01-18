var mongoose = require("mongoose");

const Products = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subscription: { type: String, required: false },
    category: {
      type: String,
      required: true,
    },
    status: { type: String, required: false },
    description: { type: String, required: false },
  },
  { collection: "products-details-v2" }
);

module.exports = mongoose.model("Productsv2", Products);
