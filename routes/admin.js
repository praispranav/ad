var express = require("express");
var router = express.Router();
const Products = require("../schema/categories");
const Image = require("../schema/imageStore");


const auth = (token, next) => {
  if (token === "jasjkiwe47541weqe12wewq8ew51qe8qw7e") return true;
  else console.log("Unauthorised");
};

const uploadImage = async (_id, imageString, category) => {
  try {
    const data = { token: undefined, productId: _id, image: imageString, category:category };

    await Image.create(data);
  } catch (err) {
    console.log(err);
    res.json({ status: "error", message: "Something Went Wrong" });
  }
};

router.post("/products", async function (req, res, next) {
  try {
    if (auth(req.body.token, next)) {
      const data = { ...req.body, token: undefined };

      const id = await Products.create(data);
      if (id._id) {
        uploadImage(id._id, data.image, data.category);
      }
      res.status(201).json({ status: "ok", message: "Created" + id._id });
    } else {
      res.status(401).json({ status: "Unauthorised" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error", message: "Something Went Wrong" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const result = await Products.find();
    res.status(200).json({ status: "ok", data: result });
    res.status;
  } catch (err) {}
});



// router.post("/products", async function (req, res, next) {

// });

module.exports = router;
