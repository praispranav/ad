var express = require("express");
var router = express.Router();
const Cart = require("../schema/cart");
const config = require("../config/keys");
const Product = require("../schema/categories");
const jwt = require('jsonwebtoken')
const privateKey = config.privateKey;

const tokenVerify = (token) => {
  return new Promise((resolve, rejects) => {
    jwt.verify(token, privateKey, function (err, decoded) {
      if (decoded) {
        resolve(decoded);
      } else {
        rejects(err);
      }
      // err
      // decoded undefined
    });
  });
};

router.post("/cart/get", async (req, res) => {
  const { token } = req.body;
  try {
    const user = await tokenVerify(token);
    if (user.data._id) {
      const result = await Cart.find({
        userId: user.data._id,
      });
      const productIds = new Array();
      result.forEach((item)=>{
        productIds.push(item.productId)
      })
      const findPerformances = await Product.find({
        _id: { $in: productIds },
      });

      res.status(200).json(findPerformances);
    } else {
        res.json({ message: "Item Cannot be Added" });
    }
  } catch (error) {
    res.status(500).json({ message: "Unauthorised User" });
  }
});

router.post("/cart/add", async (req, res) => {
  const { token, productId, selectedQuantity } = req.body;
  try {
    const user = await tokenVerify(token);
    if (user.data._id) {
      await Cart.create({
        userId: user.data._id,
        productId: productId,
        selectedQuantity: selectedQuantity,
      });
      res.status(201).json({ message: "Item Added TO Cart" });
    } else {
        res.status(401).json({ message: "Item Cannot be Added" });
    }
  } catch (error) {
      console.log(error)
    res.status(500).json({ message: "Unauthorised User" });
  }
});

router.post("/cart/edit/", async (req, res) => {
  const { token, productId, selectedQuantity, _id } = req.body;
  try {
    const user = await tokenVerify(token);
    if (user.data._id) {
      await Cart.findOneAndUpdate(
        { userId: user.data._id, _id: _id },
        {
          selectedQuantity: selectedQuantity,
        }
      ); 
      res.status(201).json({ message: "Item Updated" });
    } else {
        res.json({ message: "Item Cannot be Added" });
    }
  } catch (error) {
    res.status(500).json({ message: "Unauthorised User" });
  }
});

router.post("/cart/delete", async () => {
  const { token, _id } = req.body;
  try {
    const user = await tokenVerify(token);
    if (user.data._id) {
      await Cart.deleteOne({ userId: user.data._id, _id: _id });
      res.status(201).json({ message: "Item Deleted" });
    } else {
        res.json({ message: "Item Cannot be Added" });
    }
  } catch (error) {
    res.status(500).json({ message: "Unauthorised User" });
  }
});



module.exports = router;