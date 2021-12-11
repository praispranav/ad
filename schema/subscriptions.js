var mongoose = require("mongoose");

const Subscriptions = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    priceUnit: { type: String, required: true },
    selectedQuantity: { type: String, required: true },
    status: { type: String, required: true },
    createdDate: { type: Date, required: true },
    addressId: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String, required: false },
    pinCode: { type: String, required: true },
    phone: { type: String, required: true },
    paymentMode: { type: Object, required: true },

    deliveryTimeRange:{ type: String, required: false},
    
    days:{ type:Array, required: true },
    duration: { type:Number, required: true },
    extendedDuration: { type:Number, required: false }
  },
  { collection: "subscription" }
);

module.exports = mongoose.model("Subscriptions", Subscriptions);
