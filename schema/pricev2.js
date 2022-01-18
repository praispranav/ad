var mongoose = require("mongoose");

const Products = new mongoose.Schema(
  {
    productId: { type:String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    discount: { type:Number, required: false },
    priceUnit: { type: String, required: true }
  },
  { collection: "price-v2" }
);

module.exports = mongoose.model("Pricev2", Products);
