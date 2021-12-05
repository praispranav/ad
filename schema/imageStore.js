var mongoose = require("mongoose");

const Images = new mongoose.Schema(
  {
      productId:{ type: String, required: true},
      image:{ type:String, required: true},
      category:{type: String, required: true}
  },
  { collection: "image" }
);

module.exports = mongoose.model("Image", Images);
