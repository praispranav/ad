var mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    productId:{ type: String, required: true },
    selectedQuantity: {type: String, required: true },
},
  { collection: "cart" }
);

module.exports = mongoose.model("Cart", CartSchema);
