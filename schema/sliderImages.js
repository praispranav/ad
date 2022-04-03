var mongoose = require("mongoose");

const ImageCarausel = new mongoose.Schema(
  {
    img: { type: String, required: true }
  },
  { collection: "imgcarusel" }
);

module.exports = mongoose.model("ImageCarausel", ImageCarausel);
