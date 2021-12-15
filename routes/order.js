var express = require("express");
var router = express.Router();
const Cart = require("../schema/cart");
const config = require("../config/keys");
const Product = require("../schema/categories");
const jwt = require("jsonwebtoken");
const privateKey = config.privateKey;
var mongoose = require("mongoose");
const Subscriptions = require("../schema/subscriptions");

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
      console.log(result);
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
        const price =
          item.price -
          (item.price / 100) * (item.discount > 0 ? item.discount : 0);
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
const subscriptions = require("../schema/subscriptions");

router.post("/add", async (req, res) => {
  const { token, paymentMode, address, products } = req.body;
  try {
    const user = await tokenVerify(token);
    const newList = new Array();
    console.log("Original", products);
    console.log(
      "Filtered",
      products.filter((item) => item.subscription == 0)
    );

    products
      .filter((item) => item.subscription == 0)
      .forEach((item) => {
        const dis = (item.price / 100) * (item.discount ? item.discount : 0);
        const discountedPrice = item.price - dis;
        if (item.subscription == 0) {
          const obj = new Object();
          obj.userId = user.data._id;
          obj.status = "Processing";
          obj.createdDate = new Date();
          obj.productId = item.productId;
          obj.name = item.name;
          obj.price = discountedPrice;
          obj.priceUnit = item.priceUnit;
          obj.selectedQuantity = item.selectedQuantity;
          obj.addressId = address._id;
          obj.address1 = address.address1;
          obj.address2 = address.address2;
          obj.pinCode = address.pinCode;
          obj.phone = address.phone;
          obj.paymentMode = paymentMode.paymentMode;
          newList.push(obj);
        }
      });
    console.log("New List", newList);
    await NormalOrder.insertMany(newList);
    const subscriptionList = new Array();
    products
      .filter((item) => item.subscription == 1)
      .forEach((item) => {
        const dis = (item.price / 100) * (item.discount ? item.discount : 0);
        const discountedPrice = item.price - dis;
        if (item.subscription == 1) {
          const obj = new Object();
          obj.userId = user.data._id;
          obj.status = "Processing";
          obj.createdDate = new Date();
          obj.productId = item.productId;
          obj.name = item.name;
          obj.price = discountedPrice;
          obj.priceUnit = item.priceUnit;
          obj.selectedQuantity = item.selectedQuantity;
          obj.addressId = address._id;
          obj.address1 = address.address1;
          obj.address2 = address.address2;
          obj.pinCode = address.pinCode;
          obj.phone = address.phone;
          obj.paymentMode = paymentMode.paymentMode;
          obj.days = ["Sun", "Mon", "Tue", "Wed", "Thr", "Fri", "Sat"];
          obj.duration = 30;
          subscriptionList.push(obj);
        }
      });
    console.log(subscriptionList);
    await Subscriptions.insertMany(subscriptionList);
    await Cart.deleteMany({ userId: user.data._id });
    res.json(newList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

router.post("/subscription/get", async (req, res) => {
  const { id, token } = req.body;
  const user = await tokenVerify(token);
  try {
    if (user.data._id) {
      const result = await Subscriptions.find({});
      console.log(result);
      console.log(user.data._id);
      res.status(200).json(result);
    } else {
      res.status(401).json({ message: "Unauthorised User" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

router.post("/subscription/edit/days", async (req, res) => {
  const { days, token, subscriptionId } = req.body;
  const user = await tokenVerify(token);
  try {
    if (user.data._id) {
     const result = await Subscriptions.findByIdAndUpdate(
        { _id: subscriptionId },
        { days: days }
      );
      console.log(result)
      res.status(200).json({ message: "Days Updated" });
    } else {
      res.status(401).json({ message: "Unauthorised User" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

router.post("/subscription/edit/time-range", async (req, res) => {
  const { deliveryTimeRange, token, subscriptionId } = req.body;
  const user = await tokenVerify(token);
  try {
    if (user.data._id) {
      await Subscriptions.findByIdAndUpdate(
        { _id: subscriptionId },
        { deliveryTimeRange: deliveryTimeRange }
      );
      res.status(200).json({ message: "Days Updated" });
    } else {
      res.status(401).json({ message: "Unauthorised User" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
});
const CancelledDeliveries = require("../schema/cacelledSubscriptions");
router.post("/subscription/cancel/date", async (req, res) => {
  const { date, comment, token, subscriptionId } = req.body;
  const user = await tokenVerify(token);
  try {
    if (user.data._id) {
      await CancelledDeliveries.create({
        date: date,
        comment: comment,
        subscriptionId: subscriptionId,
      });
      console.log("Date Cancelled");

      res.status(200).json({ message: "Date Cancelled" });
    } else {
      res.status(401).json({ message: "Unauthorised User" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

router.post("/subscription/cancel/date/get", async (req, res) => {
  const { token, subscriptionId } = req.body;
  const user = await tokenVerify(token);
  try {
    if (user.data._id) {
      const result = await CancelledDeliveries.find({
        subscriptionId: subscriptionId,
      });
      res.status(200).json(result);
    } else {
      res.status(401).json({ message: "Unauthorised User" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

const ExtraQuantity = require("../schema/extraQuantitySubscription");
router.post("/subscription/extra/get", async (req, res) => {
  const { token, subscriptionId } = req.body;
  const user = await tokenVerify(token);
  try {
    if (user.data._id) {
      const result = await ExtraQuantity.find({
        subscriptionId: subscriptionId,
      });
      res.status(200).json(result);
    } else {
      res.status(401).json({ message: "Unauthorised User" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

router.post("/subscription/extra/create", async (req, res) => {
  const { token, subscriptionId, date, quantity } = req.body;
  const user = await tokenVerify(token);
  try {
    if (user.data._id) {
      const result = await ExtraQuantity.create({
        subscriptionId: subscriptionId,
        date: date,
        quantity: quantity,
      });
      console.log("Extra Quantity Added");
      res.status(200).json(result);
    } else {
      res.status(401).json({ message: "Unauthorised User" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

const Deliveries = require("../schema/deliverySubscription");
router.post("/subscription/delivery/get", async (req, res) => {
  const { token, subscriptionId } = req.body;
  const user = await tokenVerify(token);
  try {
    if (user.data._id) {
      const result = await Deliveries.find({ subscriptionId: subscriptionId });
      res.status(200).json(result);
    } else {
      res.status(401).json({ message: "Unauthorised User" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

router.post("/cancel", async (req, res) => {
  const { id, token } = req.body;
  const user = await tokenVerify(token);
  try {
    if (user.data._id) {
      await NormalOrder.findByIdAndUpdate({ _id: id }, { status: "Cancelled" });
      res.status(200).json({ message: "Order Cancelled Successfully" });
    } else {
      res.status(401).json({ message: "Unauthorised User" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

router.post("/get", async (req, res) => {
  try {
    const { token } = req.body;
    const { data } = await tokenVerify(token);
    if (data._id) {
      const result = await NormalOrder.find({ userId: data._id });
      console.log("Order", result, data);
      res.json(result);
    } else {
      res.json({ message: "Uauthorised user" });
    }
  } catch (error) {
    res.json({ message: "Something Went Wrong" });
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
