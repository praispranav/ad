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
    const data = {
      token: undefined,
      productId: _id,
      image: imageString,
      category: category,
    };

    await Image.create(data);
  } catch (err) {
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
      res.status(401).json({ message: "Unauthorised" });
    }
  } catch (err) {
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

router.post("/products/edit/:id", async (req, res) => {
  try {
    const token = req.body.token;
    if (auth(token)) {
      const id = req.params.id;
      const clone = { ...req.body, token: undefined, _id: undefined };
      const result = await Products.findOneAndUpdate({ _id: id }, clone);
      res.status(200).json({
        status: 200,
        message: `Product Updated:- ${result.name}`,
      });
    } else {
      res.status(401).json({ message: "UnAuthorised" });
    }
  } catch (error) {
    res.status(500).json({ data: [] });
  }
});

router.post("/products/delete/:id", async (req, res) => {
  try {
    const token = req.body.token;
    if (auth(token)) {
      const id = req.params.id;
      const result = await Products.deleteOne({ _id: id });

      res.status(200).json({
        status: 200,
        message: `Product Deleted`,
      });
    } else {
      res.status(401).json({ message: "UnAuthorised" });
    }
  } catch (error) {
    res.status(500).json({ data: [] });
  }
});

router.post("/products/status/:id", async (req, res) => {
  try {
    const token = req.body.token;
    if (auth(token)) {
      const id = req.params.id;
      const newStatus = req.body.status;
      const clone = { status: newStatus };
      const result = await Products.findOneAndUpdate({ _id: id }, clone);
      res.status(200).json({
        status: 200,
        message: `Status Updated:- ${result.name}`,
      });
    } else {
      res.status(401).json({ message: "UnAuthorised" });
    }
  } catch (error) {
    res.status(500).json({ data: [] });
  }
});

router.post("/products/qty/:id", async (req, res) => {
  try {
    const token = req.body.token;
    if (auth(token)) {
      const id = req.params.id;
      const newQty = req.body.availableQuantity;
      const clone = { availableQuantity: newQty };
      const result = await Products.findOneAndUpdate({ _id: id }, clone);
      res.status(200).json({
        status: 200,
        message: `Discount Updated:- ${result.name}`,
      });
    } else {
      res.status(401).json({ message: "UnAuthorised" });
    }
  } catch (error) {
    res.status(500).json({ data: [] });
  }
});

router.post("/products/discount/:id", async (req, res) => {
  try {
    const token = req.body.token;
    if (auth(token)) {
      const id = req.params.id;
      const newQty = req.body.discount;
      const clone = { discount: newQty };
      const result = await Products.findOneAndUpdate({ _id: id }, clone);
      res.status(200).json({
        status: 200,
        message: `Quantity Updated:- ${result.name}`,
      });
    } else {
      res.status(401).json({ message: "UnAuthorised" });
    }
  } catch (error) {
    res.status(500).json({ data: [] });
  }
});

module.exports = router;
