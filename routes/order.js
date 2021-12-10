var express = require("express");
var router = express.Router();
const Cart = require("../schema/cart");
const config = require("../config/keys");
const Product = require("../schema/categories");
const jwt = require("jsonwebtoken");
const privateKey = config.privateKey;
var mongoose = require("mongoose");

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
      result.forEach((item) => {
        productIds.push(mongoose.Types.ObjectId(item.productId));
      });
      const getRequiredProducts = await Product.find({
        _id: { $in: productIds },
      });
      const productById = new Array();
      getRequiredProducts.forEach((item) => (productById[item._id] = item));

      const cartWithProduct = result.map((item) => {
        const product = productById[item.productId];
        const obj = {
          _id: item._id,
          productId: product._id,
          userId: item.userId,
          selectedQuantity: item.selectedQuantity,
          name: product.name,
          availableQuantity: product.availableQuantity,
          initialQuantity: product.initialQuantity,
          price: product.price,
          priceUnit: product.priceUnit,
          subscription: product.subscription,
          discount: product.discount,
          category: product.category,
          status: product.status,
          description: product.description,
        };
        return obj;
      });
      let totalPrice = 0;
      cartWithProduct.forEach((item) => {
        const price = item.price - ( (item.price /100)/100 * item.discount)
        const localTotalPrice = price * item.selectedQuantity;
        totalPrice += localTotalPrice;
      });

      res.status(200).json({ data: cartWithProduct, total: totalPrice });
    } else {
      res.json({ message: "Cart Empty" });
    }
  } catch (error) {
    console.log(error);
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
    console.log(error);
    res.status(500).json({ message: "Unauthorised User" });
  }
});

router.post("/cart/edit/", async (req, res) => {
  const { token, selectedQuantity, _id } = req.body;
  try {
    const user = await tokenVerify(token);
    if (user.data._id) {
      await Cart.findOneAndUpdate(
        { _id: _id },
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

router.post("/cart/delete", async (req, res) => {
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
var NormalOrder = require("../schema/normalOrders");

router.post("/add", async (req, res) => {
  const { token, paymentMode, address, products,  } = req.body;
  try { 
    const user = await tokenVerify(token);
    const newList = new Array();
    products.forEach((item)=>{
      const obj = new Object();

      obj.userId = user.data._id;
      obj.status = 'Processing';
      obj.createdDate = new Date();
      obj.productId = item._id;
      obj.name = item.name;
      obj.price = item.price;
      obj.priceUnit = item.priceUnit;
      obj.selectedQuantity = item.selectedQuantity
      obj.addressId = address._id;
      obj.address1 = address.address1
      obj.address2 = address.address2
      obj.pinCode = address.pinCode
      obj.phone = address.phone
      obj.paymentMode = paymentMode.paymentMode
      newList.push(obj)
      //   item.status = "Processing";
      //   item.createdDate = new Date();
      //   return item;
    })
    // const userId = user.date._id;
    // const orders = originalOrders.map((item) => {
    //   item.userId = userId;
    //   item.status = "Processing";
    //   item.createdDate = new Date();
    //   return item;
    // });
    await NormalOrder.insertMany(newList);
    await Cart.deleteMany({ userId: user.data._id})
    // if (result) {
    // } else {
    //   res.status(400).json({ message: "Order Failed" });
    // }
    res.json(newList)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

router.post("/edit", async (req, res) => {
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
